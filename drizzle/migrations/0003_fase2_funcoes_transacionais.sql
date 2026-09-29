-- Finalizar romaneio: romaneio + estoque (movimento + cache) + cache do item em UMA transação.
CREATE OR REPLACE FUNCTION public.finalizar_romaneio(_romaneio_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.romaneios%ROWTYPE; it public.contrato_itens%ROWTYPE; c public.contratos%ROWTYPE;
  v_user uuid := auth.uid(); v_peso numeric; v_tipo varchar; v_sinal int; t record; v_msg text := '';
BEGIN
  IF NOT public.pode_gravar() THEN RAISE EXCEPTION 'Seu perfil não permite finalizar romaneios.'; END IF;
  SELECT * INTO r FROM public.romaneios WHERE id = _romaneio_id AND deletado_em IS NULL FOR UPDATE;
  IF NOT FOUND OR NOT public.pode_acessar_filial(r.filial_id) THEN RAISE EXCEPTION 'Romaneio não encontrado.'; END IF;
  IF r.status <> 'CLASSIFICADO' THEN RAISE EXCEPTION 'Somente romaneio CLASSIFICADO pode ser finalizado (status atual: %).', r.status; END IF;
  v_peso := CASE WHEN r.peso_liquido_seco_limpo > 0 THEN r.peso_liquido_seco_limpo ELSE r.peso_liquido END;
  IF v_peso <= 0 THEN RAISE EXCEPTION 'Romaneio sem peso líquido — conclua pesagem e classificação.'; END IF;

  IF r.contrato_item_id IS NOT NULL THEN
    SELECT * INTO it FROM public.contrato_itens WHERE id = r.contrato_item_id FOR UPDATE;
    SELECT * INTO c FROM public.contratos WHERE id = it.contrato_id FOR UPDATE;
    IF c.status IN ('CANCELADO','LIQUIDADO') THEN RAISE EXCEPTION 'Contrato % está % — não recebe entregas.', c.numero_contrato, c.status; END IF;
    SELECT * INTO t FROM public.calc_tolerancia(it.quantidade_base, public.entregue_verdade_item(it.id), v_peso, c.tolerancia_pct, it.fator_base);
    IF t.status = 'EXCEDE' THEN
      RAISE EXCEPTION 'Excede o contratado além da tolerância de %%% — excesso de % (limite %).',
        trim(to_char(c.tolerancia_pct, 'FM990D##')),
        CASE WHEN it.fator_base = 1 THEN public.fmt_qtd(t.excesso_kg,'KG') ELSE public.fmt_qtd(t.excesso_neg, it.unidade_codigo) || ' / ' || public.fmt_qtd(t.excesso_kg,'KG') END,
        CASE WHEN it.fator_base = 1 THEN public.fmt_qtd(t.limite_kg,'KG') ELSE public.fmt_qtd(t.limite_neg, it.unidade_codigo) || ' / ' || public.fmt_qtd(t.limite_kg,'KG') END;
    END IF;
    v_tipo := CASE WHEN c.tipo_contrato = 'COMPRA' THEN 'ENTRADA' ELSE 'SAIDA' END;
  ELSE
    v_tipo := r.tipo_operacao;
  END IF;
  v_sinal := CASE WHEN v_tipo = 'ENTRADA' THEN 1 ELSE -1 END;

  PERFORM set_config('agroerp.via_funcao', 'on', true);
  UPDATE public.romaneios SET status = 'FINALIZADO', finalizado_em = now(), finalizado_por = v_user, atualizado_em = now(), atualizado_por = v_user WHERE id = r.id;
  PERFORM set_config('agroerp.via_funcao', '', true);

  INSERT INTO public.movimentacoes_estoque (grupo_id, empresa_id, filial_id, produto_id, romaneio_id, tipo, quantidade_base, observacao, criado_por, atualizado_por)
  VALUES (r.grupo_id, r.empresa_id, r.filial_id, r.produto_id, r.id, v_tipo, v_sinal * v_peso, 'Romaneio nº ' || r.numero, v_user, v_user);

  INSERT INTO public.saldos_estoque (grupo_id, empresa_id, filial_id, produto_id, saldo_base_cache, criado_por, atualizado_por)
  VALUES (r.grupo_id, r.empresa_id, r.filial_id, r.produto_id, v_sinal * v_peso, v_user, v_user)
  ON CONFLICT (filial_id, produto_id) DO UPDATE SET saldo_base_cache = public.saldos_estoque.saldo_base_cache + EXCLUDED.saldo_base_cache, atualizado_em = now(), atualizado_por = v_user;

  IF r.contrato_item_id IS NOT NULL THEN
    UPDATE public.contrato_itens SET entregue_base_cache = public.entregue_verdade_item(it.id), atualizado_em = now(), atualizado_por = v_user WHERE id = it.id;
    UPDATE public.contratos SET status = 'PARCIAL', atualizado_em = now(), atualizado_por = v_user WHERE id = c.id AND status = 'ABERTO';
    IF t.status = 'DENTRO_TOLERANCIA' THEN v_msg := ' Entrega acima do contratado, dentro da tolerância.'; END IF;
  END IF;
  RETURN jsonb_build_object('sucesso', true, 'mensagem', 'Romaneio finalizado. Estoque atualizado.' || v_msg, 'peso_base', v_peso,
    'tolerancia', CASE WHEN t IS NULL THEN NULL ELSE to_jsonb(t) END);
END $$;

-- Estorno: supervisor (Administrador) + justificativa ≥ 20; recusa se houver fixação/liquidação ativa.
CREATE OR REPLACE FUNCTION public.estornar_romaneio(_romaneio_id uuid, _justificativa text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.romaneios%ROWTYPE; mov public.movimentacoes_estoque%ROWTYPE; v_user uuid := auth.uid(); v_entregue numeric; v_nome text;
BEGIN
  IF NOT public.eh_admin() THEN RAISE EXCEPTION 'Estorno exige autorização de supervisor (perfil Administrador).'; END IF;
  IF length(trim(coalesce(_justificativa,''))) < 20 THEN RAISE EXCEPTION 'Justificativa do estorno deve ter no mínimo 20 caracteres.'; END IF;
  SELECT * INTO r FROM public.romaneios WHERE id = _romaneio_id AND deletado_em IS NULL FOR UPDATE;
  IF NOT FOUND OR NOT public.pode_acessar_filial(r.filial_id) THEN RAISE EXCEPTION 'Romaneio não encontrado.'; END IF;
  IF r.status <> 'FINALIZADO' THEN RAISE EXCEPTION 'Somente romaneio FINALIZADO pode ser estornado (status atual: %).', r.status; END IF;
  IF r.contrato_item_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.fixacoes WHERE contrato_item_id = r.contrato_item_id AND status = 'ATIVA' AND deletado_em IS NULL) THEN
      RAISE EXCEPTION 'Romaneio com preço fixado — reverter a fixação antes de estornar.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.liquidacoes WHERE contrato_item_id = r.contrato_item_id AND status = 'ATIVA' AND deletado_em IS NULL) THEN
      RAISE EXCEPTION 'Romaneio referenciado em liquidação — reverter a liquidação antes de estornar.';
    END IF;
  END IF;

  SELECT * INTO mov FROM public.movimentacoes_estoque WHERE romaneio_id = r.id AND tipo IN ('ENTRADA','SAIDA') AND deletado_em IS NULL LIMIT 1;
  IF FOUND THEN
    INSERT INTO public.movimentacoes_estoque (grupo_id, empresa_id, filial_id, produto_id, romaneio_id, tipo, quantidade_base, observacao, criado_por, atualizado_por)
    VALUES (r.grupo_id, r.empresa_id, r.filial_id, r.produto_id, r.id, 'ESTORNO', -mov.quantidade_base, 'Estorno do romaneio nº ' || r.numero, v_user, v_user);
    UPDATE public.saldos_estoque SET saldo_base_cache = saldo_base_cache - mov.quantidade_base, atualizado_em = now(), atualizado_por = v_user
      WHERE filial_id = r.filial_id AND produto_id = r.produto_id;
  END IF;

  PERFORM set_config('agroerp.via_funcao', 'on', true);
  UPDATE public.romaneios SET status = 'ESTORNADO', estorno_justificativa = trim(_justificativa), estornado_em = now(), estornado_por = v_user,
    atualizado_em = now(), atualizado_por = v_user WHERE id = r.id;
  PERFORM set_config('agroerp.via_funcao', '', true);

  IF r.contrato_item_id IS NOT NULL THEN
    v_entregue := public.entregue_verdade_item(r.contrato_item_id);
    UPDATE public.contrato_itens SET entregue_base_cache = v_entregue, atualizado_em = now(), atualizado_por = v_user WHERE id = r.contrato_item_id;
    UPDATE public.contratos SET status = CASE WHEN v_entregue > 0 THEN 'PARCIAL' ELSE 'ABERTO' END, atualizado_em = now(), atualizado_por = v_user
      WHERE id = (SELECT contrato_id FROM public.contrato_itens WHERE id = r.contrato_item_id) AND status IN ('ABERTO','PARCIAL','FINALIZADO');
  END IF;

  SELECT nome INTO v_nome FROM public.usuarios WHERE auth_user_id = v_user;
  INSERT INTO public.autorizacoes_log (usuario_id, usuario_nome, acao, registro_tipo, registro_id, descricao, justificativa, resultado, grupo_id, empresa_id, filial_id)
  VALUES (v_user, coalesce(v_nome,''), 'ESTORNO_ROMANEIO', 'ROMANEIO', r.id::text, 'Estorno do romaneio nº ' || r.numero, trim(_justificativa), 'AUTORIZADO', r.grupo_id, r.empresa_id, r.filial_id);

  RETURN jsonb_build_object('sucesso', true, 'mensagem', 'Romaneio estornado. Estoque e saldo do contrato revertidos.');
END $$;

-- Reconciliação: compara cache × verdade (ESTORNADO/CANCELADO excluídos). Apenas reporta.
CREATE OR REPLACE FUNCTION public.reconciliar_saldos_contratos()
RETURNS TABLE (contrato_item_id uuid, numero_contrato varchar, cache_base numeric, verdade_base numeric, diferenca numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, c.numero_contrato, i.entregue_base_cache, public.entregue_verdade_item(i.id), i.entregue_base_cache - public.entregue_verdade_item(i.id)
  FROM public.contrato_itens i JOIN public.contratos c ON c.id = i.contrato_id
  WHERE i.deletado_em IS NULL AND public.pode_acessar_filial(i.filial_id)
    AND abs(i.entregue_base_cache - public.entregue_verdade_item(i.id)) > 0.0001
$$;

CREATE OR REPLACE FUNCTION public.reconciliar_saldos_estoque()
RETURNS TABLE (filial_id uuid, produto_id uuid, cache_base numeric, verdade_base numeric, diferenca numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH verdade AS (
    SELECT r.filial_id, r.produto_id,
      SUM(CASE WHEN COALESCE(c.tipo_contrato, CASE WHEN r.tipo_operacao='ENTRADA' THEN 'COMPRA' ELSE 'VENDA' END) = 'COMPRA' THEN 1 ELSE -1 END
          * CASE WHEN r.peso_liquido_seco_limpo > 0 THEN r.peso_liquido_seco_limpo ELSE r.peso_liquido END) AS v
    FROM public.romaneios r
    LEFT JOIN public.contrato_itens i ON i.id = r.contrato_item_id
    LEFT JOIN public.contratos c ON c.id = i.contrato_id
    WHERE r.status = 'FINALIZADO' AND r.deletado_em IS NULL
    GROUP BY r.filial_id, r.produto_id
  ), ajustes AS (
    SELECT filial_id, produto_id, SUM(quantidade_base) AS a FROM public.movimentacoes_estoque WHERE tipo = 'AJUSTE' AND deletado_em IS NULL GROUP BY 1,2
  )
  SELECT s.filial_id, s.produto_id, s.saldo_base_cache, COALESCE(v.v,0) + COALESCE(a.a,0), s.saldo_base_cache - (COALESCE(v.v,0) + COALESCE(a.a,0))
  FROM public.saldos_estoque s
  LEFT JOIN verdade v ON v.filial_id = s.filial_id AND v.produto_id = s.produto_id
  LEFT JOIN ajustes a ON a.filial_id = s.filial_id AND a.produto_id = s.produto_id
  WHERE s.deletado_em IS NULL AND public.pode_acessar_filial(s.filial_id)
    AND abs(s.saldo_base_cache - (COALESCE(v.v,0) + COALESCE(a.a,0))) > 0.0001
$$;

REVOKE EXECUTE ON FUNCTION public.finalizar_romaneio(uuid), public.estornar_romaneio(uuid, text), public.reconciliar_saldos_contratos(), public.reconciliar_saldos_estoque() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalizar_romaneio(uuid), public.estornar_romaneio(uuid, text), public.reconciliar_saldos_contratos(), public.reconciliar_saldos_estoque(), public.calc_tolerancia(numeric,numeric,numeric,numeric,numeric), public.fator_base(uuid, varchar) TO authenticated;
