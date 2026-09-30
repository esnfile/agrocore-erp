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
      RAISE EXCEPTION 'Excede o contratado além da tolerância de % — excesso de % (limite %).',
        replace(rtrim(rtrim(to_char(c.tolerancia_pct, 'FM990.####'),'0'),'.'),'.',',') || '%',
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