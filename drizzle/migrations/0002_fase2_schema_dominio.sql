-- =====================================================================
-- FASE 2.1 — SCHEMA DE DOMÍNIO AgroERP (PostgreSQL padrão, portável p/ .NET/EF Core)
-- =====================================================================

CREATE TABLE public.grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(150) NOT NULL
);
CREATE TABLE public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  nome_razao varchar(200) NOT NULL,
  cpf_cnpj varchar(20) NOT NULL,
  tipo_empresa varchar(20) NOT NULL DEFAULT 'ARMAZEM',
  ativo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.filiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  nome_razao varchar(200) NOT NULL,
  cpf_cnpj varchar(20),
  inscricao_estadual varchar(30),
  endereco varchar(150), numero_km varchar(20), bairro varchar(70), cep varchar(10),
  cidade varchar(100), estado varchar(2),
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  empresa_padrao_id uuid REFERENCES public.empresas(id),
  filial_padrao_id uuid REFERENCES public.filiais(id),
  nome varchar(150) NOT NULL,
  email varchar(255) NOT NULL,
  ativo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.usuario_filiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  filial_id uuid NOT NULL REFERENCES public.filiais(id),
  UNIQUE (usuario_id, filial_id)
);

-- Estrutura futura de permissões: Módulo -> Submódulo -> Programa -> Permissão
CREATE TABLE public.gersys_modulos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome varchar(100) NOT NULL, nivel varchar(3) NOT NULL);
CREATE TABLE public.gersys_submodulos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), gersys_modulos_id uuid NOT NULL REFERENCES public.gersys_modulos(id), nome varchar(100) NOT NULL, nivel varchar(3) NOT NULL);
CREATE TABLE public.gersys_programas (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), gersys_submodulos_id uuid NOT NULL REFERENCES public.gersys_submodulos(id), nome varchar(100) NOT NULL, nivel varchar(3) NOT NULL);
CREATE TABLE public.permissoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), gersys_programas_id uuid NOT NULL REFERENCES public.gersys_programas(id), nome varchar(100) NOT NULL, codigo varchar(100) NOT NULL UNIQUE);
CREATE TABLE public.usuario_permissoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), usuario_id uuid NOT NULL REFERENCES public.usuarios(id), permissao_id uuid NOT NULL REFERENCES public.permissoes(id), UNIQUE (usuario_id, permissao_id));

CREATE TABLE public.pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  nome_razao varchar(200) NOT NULL,
  cpf_cnpj varchar(20),
  inscricao_estadual varchar(30),
  relacao_comercial varchar(100) NOT NULL DEFAULT 'CLIENTE',
  eh_motorista boolean NOT NULL DEFAULT false,
  cidade varchar(100), estado varchar(2), telefone varchar(30), email varchar(255),
  ativo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.unidades_medida (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  codigo varchar(10) NOT NULL,
  descricao varchar(60) NOT NULL,
  tipo varchar(10) NOT NULL CHECK (tipo IN ('PESO','VOLUME','UNIDADE')),
  fator_universal_base numeric(18,6),
  ativo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  descricao varchar(150) NOT NULL,
  tipo_unidade varchar(10) NOT NULL DEFAULT 'PESO' CHECK (tipo_unidade IN ('PESO','VOLUME','UNIDADE')),
  unidade_base varchar(10) NOT NULL DEFAULT 'KG',
  eh_grao boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.produto_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  unidade_codigo varchar(10) NOT NULL,
  fator_base numeric(18,6) NOT NULL CHECK (fator_base > 0)
);
CREATE TABLE public.plano_contas (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), codigo varchar(30) NOT NULL, descricao varchar(150) NOT NULL, tipo varchar(20) NOT NULL DEFAULT 'DESPESA', ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.centros_custo (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), codigo varchar(30) NOT NULL, descricao varchar(150) NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.tipos_lancamento (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), descricao varchar(150) NOT NULL, tipo_movimento varchar(20) NOT NULL CHECK (tipo_movimento IN ('RECEBIMENTO','PAGAMENTO','TRANSFERENCIA')), categoria varchar(40), ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.moedas (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), codigo varchar(5) NOT NULL, descricao varchar(60) NOT NULL, simbolo varchar(5) NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.cotacoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), moeda_id uuid NOT NULL REFERENCES public.moedas(id), data_cotacao date NOT NULL, valor numeric(18,6) NOT NULL CHECK (valor > 0), UNIQUE (moeda_id, data_cotacao));
CREATE TABLE public.condicoes_descontos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), produto_id uuid REFERENCES public.produtos(id), descricao varchar(100) NOT NULL, tipo varchar(25) NOT NULL CHECK (tipo IN ('PERCENTUAL','VALOR_FIXO_UNITARIO','VALOR_FIXO_TOTAL','TABELA_CLASSIFICACAO')), ordem_aplicacao int NOT NULL DEFAULT 1, valor_padrao numeric(18,6) NOT NULL DEFAULT 0, ativo boolean NOT NULL DEFAULT true);

CREATE TABLE public.safras (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), descricao varchar(60) NOT NULL, data_inicio date NOT NULL, data_fim date NOT NULL, status varchar(20) NOT NULL DEFAULT 'ABERTA');
CREATE TABLE public.cultivos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), safra_id uuid NOT NULL REFERENCES public.safras(id), produto_id uuid NOT NULL REFERENCES public.produtos(id), area_plantada_ha numeric(18,4) NOT NULL DEFAULT 0, produtividade_estimada_kg_ha numeric(18,4) NOT NULL DEFAULT 0, status_colheita varchar(20) NOT NULL DEFAULT 'NAO_INICIADA');

CREATE TABLE public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  filial_id uuid NOT NULL REFERENCES public.filiais(id),
  numero_contrato varchar(30) NOT NULL,
  tipo_contrato varchar(10) NOT NULL CHECK (tipo_contrato IN ('COMPRA','VENDA')),
  modalidade_preco varchar(20) NOT NULL DEFAULT 'FIXO' CHECK (modalidade_preco IN ('FIXO','A_FIXAR')),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id),
  moeda_id uuid REFERENCES public.moedas(id),
  safra_id uuid REFERENCES public.safras(id),
  data_contrato date NOT NULL,
  data_entrega_inicio date, data_entrega_fim date,
  tolerancia_pct numeric(7,4) NOT NULL DEFAULT 0 CHECK (tolerancia_pct >= 0),
  status varchar(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO','PARCIAL','FINALIZADO','LIQUIDADO','CANCELADO')),
  observacao text,
  UNIQUE (empresa_id, numero_contrato)
);
CREATE TABLE public.contrato_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  filial_id uuid NOT NULL REFERENCES public.filiais(id),
  contrato_id uuid NOT NULL REFERENCES public.contratos(id),
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  unidade_codigo varchar(10) NOT NULL,
  fator_base numeric(18,6) NOT NULL CHECK (fator_base > 0),
  quantidade numeric(18,4) NOT NULL CHECK (quantidade > 0),
  quantidade_base numeric(18,4) GENERATED ALWAYS AS (quantidade * fator_base) STORED,
  preco_unitario numeric(18,6) NOT NULL DEFAULT 0 CHECK (preco_unitario >= 0),
  entregue_base_cache numeric(18,4) NOT NULL DEFAULT 0
);

CREATE TABLE public.romaneios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  filial_id uuid NOT NULL REFERENCES public.filiais(id),
  numero integer NOT NULL,
  tipo_operacao varchar(10) NOT NULL CHECK (tipo_operacao IN ('ENTRADA','SAIDA')),
  origem_criacao varchar(20) NOT NULL DEFAULT 'TELA_ROMANEIO',
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  pessoa_id uuid REFERENCES public.pessoas(id),
  contrato_item_id uuid REFERENCES public.contrato_itens(id),
  cultivo_id uuid REFERENCES public.cultivos(id),
  motorista_nome varchar(150), placa varchar(10),
  peso_bruto numeric(18,4) NOT NULL DEFAULT 0,
  peso_tara numeric(18,4) NOT NULL DEFAULT 0,
  peso_liquido numeric(18,4) NOT NULL DEFAULT 0,
  total_peso_descontado numeric(18,4) NOT NULL DEFAULT 0,
  peso_liquido_seco_limpo numeric(18,4) NOT NULL DEFAULT 0 CHECK (peso_liquido_seco_limpo = trunc(peso_liquido_seco_limpo)),
  status varchar(25) NOT NULL DEFAULT 'AGUARDANDO_PESAGEM' CHECK (status IN ('AGUARDANDO_PESAGEM','AGUARDANDO_CLASSIFICACAO','AGUARDANDO_VINCULO','CLASSIFICADO','FINALIZADO','CANCELADO','ESTORNADO')),
  data_romaneio date NOT NULL DEFAULT CURRENT_DATE,
  finalizado_em timestamptz, finalizado_por uuid,
  estorno_justificativa text, estornado_em timestamptz, estornado_por uuid,
  cancelamento_justificativa text,
  observacao text
);
CREATE TABLE public.romaneio_pesagens (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), romaneio_id uuid NOT NULL REFERENCES public.romaneios(id), sequencia smallint NOT NULL CHECK (sequencia IN (1,2)), peso_kg numeric(18,4) NOT NULL CHECK (peso_kg > 0), data_hora timestamptz NOT NULL DEFAULT now(), UNIQUE (romaneio_id, sequencia));
CREATE TABLE public.romaneio_classificacao (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), romaneio_id uuid NOT NULL REFERENCES public.romaneios(id), tipo_classificacao varchar(40) NOT NULL, percentual_medido numeric(9,4) NOT NULL DEFAULT 0, percentual_desconto numeric(9,4) NOT NULL DEFAULT 0, peso_descontado_kg numeric(18,4) NOT NULL DEFAULT 0 CHECK (peso_descontado_kg = trunc(peso_descontado_kg)), UNIQUE (romaneio_id, tipo_classificacao));

CREATE TABLE public.fixacoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), contrato_item_id uuid NOT NULL REFERENCES public.contrato_itens(id), data_fixacao date NOT NULL, quantidade numeric(18,4) NOT NULL CHECK (quantidade > 0), preco_fixado numeric(18,6) NOT NULL CHECK (preco_fixado > 0), status varchar(15) NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA','REVERTIDA')));
CREATE TABLE public.liquidacoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), contrato_item_id uuid NOT NULL REFERENCES public.contrato_itens(id), data_liquidacao date NOT NULL, quantidade_base numeric(18,4) NOT NULL, valor_bruto numeric(18,6) NOT NULL, valor_liquido numeric(18,6) NOT NULL, justificativa text, status varchar(15) NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA','REVERTIDA')));

CREATE TABLE public.movimentacoes_estoque (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), produto_id uuid NOT NULL REFERENCES public.produtos(id), romaneio_id uuid REFERENCES public.romaneios(id), tipo varchar(10) NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE','ESTORNO')), quantidade_base numeric(18,4) NOT NULL, data_movimento timestamptz NOT NULL DEFAULT now(), observacao text);
CREATE TABLE public.saldos_estoque (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), produto_id uuid NOT NULL REFERENCES public.produtos(id), saldo_base_cache numeric(18,4) NOT NULL DEFAULT 0, UNIQUE (filial_id, produto_id));

CREATE TABLE public.contas_pagar (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), pessoa_id uuid REFERENCES public.pessoas(id), contrato_id uuid REFERENCES public.contratos(id), liquidacao_id uuid REFERENCES public.liquidacoes(id), fixacao_id uuid REFERENCES public.fixacoes(id), plano_conta_id uuid REFERENCES public.plano_contas(id), centro_custo_id uuid REFERENCES public.centros_custo(id), documento varchar(50), descricao varchar(200) NOT NULL, numero_parcela int NOT NULL DEFAULT 1, vencimento date NOT NULL, valor numeric(18,6) NOT NULL CHECK (valor >= 0), valor_pago numeric(18,6) NOT NULL DEFAULT 0, tipo_especial varchar(20), status varchar(15) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PREVISTO','PENDENTE','PARCIAL','PAGO','CANCELADO')));
CREATE TABLE public.contas_receber (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), pessoa_id uuid REFERENCES public.pessoas(id), contrato_id uuid REFERENCES public.contratos(id), liquidacao_id uuid REFERENCES public.liquidacoes(id), fixacao_id uuid REFERENCES public.fixacoes(id), plano_conta_id uuid REFERENCES public.plano_contas(id), centro_custo_id uuid REFERENCES public.centros_custo(id), documento varchar(50), descricao varchar(200) NOT NULL, numero_parcela int NOT NULL DEFAULT 1, vencimento date NOT NULL, valor numeric(18,6) NOT NULL CHECK (valor >= 0), valor_pago numeric(18,6) NOT NULL DEFAULT 0, tipo_especial varchar(20), status varchar(15) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PREVISTO','PENDENTE','PARCIAL','PAGO','CANCELADO')));
CREATE TABLE public.caixa_lancamentos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), grupo_id uuid NOT NULL REFERENCES public.grupos(id), empresa_id uuid NOT NULL REFERENCES public.empresas(id), filial_id uuid NOT NULL REFERENCES public.filiais(id), tipo_lancamento_id uuid REFERENCES public.tipos_lancamento(id), pessoa_id uuid REFERENCES public.pessoas(id), conta_pagar_id uuid REFERENCES public.contas_pagar(id), conta_receber_id uuid REFERENCES public.contas_receber(id), categoria varchar(40) NOT NULL DEFAULT 'GERAL', tipo_movimento varchar(20) NOT NULL CHECK (tipo_movimento IN ('RECEBIMENTO','PAGAMENTO','TRANSFERENCIA','SALDO_INICIAL')), data_lancamento date NOT NULL, valor numeric(18,6) NOT NULL CHECK (valor > 0), forma_pagamento varchar(20), descricao varchar(200) NOT NULL, autorizacao_log_id uuid);

ALTER TABLE public.autorizacoes_log ADD COLUMN grupo_id uuid, ADD COLUMN empresa_id uuid, ADD COLUMN filial_id uuid;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['grupos','empresas','filiais','usuarios','usuario_filiais','gersys_modulos','gersys_submodulos','gersys_programas','permissoes','usuario_permissoes','pessoas','unidades_medida','produtos','produto_unidades','plano_contas','centros_custo','tipos_lancamento','moedas','cotacoes','condicoes_descontos','safras','cultivos','contratos','contrato_itens','romaneios','romaneio_pesagens','romaneio_classificacao','fixacoes','liquidacoes','movimentacoes_estoque','saldos_estoque','contas_pagar','contas_receber','caixa_lancamentos']
  LOOP
    EXECUTE format('ALTER TABLE public.%I
      ADD COLUMN IF NOT EXISTS criado_em timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS criado_por uuid,
      ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS atualizado_por uuid,
      ADD COLUMN IF NOT EXISTS deletado_em timestamptz,
      ADD COLUMN IF NOT EXISTS deletado_por uuid', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

CREATE UNIQUE INDEX ux_romaneios_filial_numero ON public.romaneios (filial_id, numero) WHERE deletado_em IS NULL;
CREATE UNIQUE INDEX ux_pessoas_grupo_cpf_cnpj ON public.pessoas (grupo_id, cpf_cnpj) WHERE deletado_em IS NULL AND cpf_cnpj IS NOT NULL;
CREATE UNIQUE INDEX ux_empresas_cpf_cnpj ON public.empresas (cpf_cnpj) WHERE deletado_em IS NULL;
CREATE UNIQUE INDEX ux_unidades_grupo_codigo ON public.unidades_medida (grupo_id, codigo) WHERE deletado_em IS NULL;
CREATE UNIQUE INDEX ux_produto_unidades ON public.produto_unidades (produto_id, unidade_codigo) WHERE deletado_em IS NULL;
CREATE INDEX ix_romaneios_item ON public.romaneios (contrato_item_id) WHERE deletado_em IS NULL;
CREATE INDEX ix_mov_filial_produto ON public.movimentacoes_estoque (filial_id, produto_id) WHERE deletado_em IS NULL;
CREATE INDEX ix_itens_contrato ON public.contrato_itens (contrato_id);

CREATE OR REPLACE FUNCTION public.usuario_grupo_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT grupo_id FROM public.usuarios WHERE auth_user_id = auth.uid() AND ativo AND deletado_em IS NULL LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.usuario_id_atual() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid() AND ativo AND deletado_em IS NULL LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.pode_acessar_filial(_filial_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.filiais f ON f.id = _filial_id AND f.grupo_id = u.grupo_id
    WHERE u.auth_user_id = auth.uid() AND u.ativo AND u.deletado_em IS NULL
      AND (NOT EXISTS (SELECT 1 FROM public.usuario_filiais uf WHERE uf.usuario_id = u.id AND uf.deletado_em IS NULL)
           OR EXISTS (SELECT 1 FROM public.usuario_filiais uf WHERE uf.usuario_id = u.id AND uf.filial_id = _filial_id AND uf.deletado_em IS NULL))
  )
$$;
CREATE OR REPLACE FUNCTION public.pode_gravar() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.usuario_grupo_id() IS NOT NULL
     AND (public.has_role(auth.uid(), 'ADMINISTRADOR') OR public.has_role(auth.uid(), 'OPERADOR'))
$$;
CREATE OR REPLACE FUNCTION public.eh_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.usuario_grupo_id() IS NOT NULL AND public.has_role(auth.uid(), 'ADMINISTRADOR')
$$;

CREATE POLICY grupos_select ON public.grupos FOR SELECT TO authenticated USING (id = public.usuario_grupo_id());
CREATE POLICY grupos_update ON public.grupos FOR UPDATE TO authenticated USING (id = public.usuario_grupo_id() AND public.eh_admin()) WITH CHECK (id = public.usuario_grupo_id());
CREATE POLICY empresas_select ON public.empresas FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY empresas_insert ON public.empresas FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.eh_admin());
CREATE POLICY empresas_update ON public.empresas FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.eh_admin()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE POLICY filiais_select ON public.filiais FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY filiais_insert ON public.filiais FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.eh_admin());
CREATE POLICY filiais_update ON public.filiais FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.eh_admin()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE POLICY usuarios_select ON public.usuarios FOR SELECT TO authenticated USING (auth_user_id = auth.uid() OR (grupo_id = public.usuario_grupo_id() AND public.eh_admin()));
CREATE POLICY usuarios_insert ON public.usuarios FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.eh_admin());
CREATE POLICY usuarios_update ON public.usuarios FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.eh_admin()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE POLICY usuario_filiais_select ON public.usuario_filiais FOR SELECT TO authenticated USING (usuario_id = public.usuario_id_atual() OR (public.eh_admin() AND public.pode_acessar_filial(filial_id)));
CREATE POLICY usuario_filiais_insert ON public.usuario_filiais FOR INSERT TO authenticated WITH CHECK (public.eh_admin() AND public.pode_acessar_filial(filial_id));
CREATE POLICY usuario_filiais_update ON public.usuario_filiais FOR UPDATE TO authenticated USING (public.eh_admin() AND public.pode_acessar_filial(filial_id)) WITH CHECK (public.eh_admin() AND public.pode_acessar_filial(filial_id));
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['gersys_modulos','gersys_submodulos','gersys_programas','permissoes'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.usuario_grupo_id() IS NOT NULL)', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.eh_admin())', t||'_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.eh_admin()) WITH CHECK (public.eh_admin())', t||'_update', t);
  END LOOP;
END $$;
CREATE POLICY usuario_permissoes_select ON public.usuario_permissoes FOR SELECT TO authenticated USING (usuario_id = public.usuario_id_atual() OR public.eh_admin());
CREATE POLICY usuario_permissoes_insert ON public.usuario_permissoes FOR INSERT TO authenticated WITH CHECK (public.eh_admin());
CREATE POLICY usuario_permissoes_update ON public.usuario_permissoes FOR UPDATE TO authenticated USING (public.eh_admin()) WITH CHECK (public.eh_admin());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pessoas','unidades_medida','produtos','produto_unidades','tipos_lancamento'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id())', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.pode_gravar())', t||'_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.pode_gravar()) WITH CHECK (grupo_id = public.usuario_grupo_id())', t||'_update', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['plano_contas','centros_custo','moedas','cotacoes','condicoes_descontos'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id())', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.eh_admin())', t||'_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.eh_admin()) WITH CHECK (grupo_id = public.usuario_grupo_id())', t||'_update', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['safras','cultivos','contratos','contrato_itens','romaneios','romaneio_pesagens','romaneio_classificacao','fixacoes','liquidacoes','contas_pagar','contas_receber','caixa_lancamentos'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.pode_acessar_filial(filial_id))', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.pode_acessar_filial(filial_id) AND public.pode_gravar())', t||'_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.pode_acessar_filial(filial_id) AND public.pode_gravar()) WITH CHECK (public.pode_acessar_filial(filial_id))', t||'_update', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['movimentacoes_estoque','saldos_estoque'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.pode_acessar_filial(filial_id))', t||'_select', t);
  END LOOP;
END $$;
REVOKE INSERT, UPDATE ON public.movimentacoes_estoque, public.saldos_estoque FROM authenticated;
REVOKE UPDATE ON public.contrato_itens FROM authenticated;
GRANT UPDATE (produto_id, unidade_codigo, fator_base, quantidade, preco_unitario, atualizado_em, atualizado_por, deletado_em, deletado_por) ON public.contrato_itens TO authenticated;

CREATE OR REPLACE FUNCTION public.fator_base(_produto_id uuid, _unidade varchar) RETURNS numeric
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE v numeric; p record;
BEGIN
  SELECT * INTO p FROM public.produtos WHERE id = _produto_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado para conversão de unidade.'; END IF;
  IF upper(_unidade) = upper(p.unidade_base) THEN RETURN 1; END IF;
  SELECT fator_base INTO v FROM public.produto_unidades WHERE produto_id = _produto_id AND upper(unidade_codigo) = upper(_unidade) AND deletado_em IS NULL;
  IF v IS NOT NULL THEN RETURN v; END IF;
  SELECT fator_universal_base INTO v FROM public.unidades_medida WHERE grupo_id = p.grupo_id AND upper(codigo) = upper(_unidade) AND deletado_em IS NULL;
  IF v IS NOT NULL THEN RETURN v; END IF;
  RAISE EXCEPTION 'Unidade "%" não está configurada no produto "%".', _unidade, p.descricao;
END $$;

CREATE OR REPLACE FUNCTION public.calc_tolerancia(_total_kg numeric, _entregue_kg numeric, _peso_kg numeric, _tolerancia_pct numeric, _fator numeric)
RETURNS TABLE (status text, saldo_kg numeric, excesso_kg numeric, limite_kg numeric, excesso_neg numeric, limite_neg numeric, saldo_final_kg numeric)
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  saldo_kg := _total_kg - _entregue_kg;
  excesso_kg := GREATEST(0, _peso_kg - saldo_kg);
  limite_kg := _total_kg * _tolerancia_pct / 100;
  status := CASE WHEN excesso_kg <= 0.000001 THEN 'OK' WHEN excesso_kg > limite_kg + 0.000001 THEN 'EXCEDE' ELSE 'DENTRO_TOLERANCIA' END;
  excesso_neg := excesso_kg / _fator;
  limite_neg := limite_kg / _fator;
  saldo_final_kg := saldo_kg - _peso_kg;
  RETURN NEXT;
END $$;

CREATE OR REPLACE FUNCTION public.entregue_verdade_item(_item_id uuid) RETURNS numeric
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(SUM(CASE WHEN peso_liquido_seco_limpo > 0 THEN peso_liquido_seco_limpo ELSE peso_liquido END), 0)
  FROM public.romaneios WHERE contrato_item_id = _item_id AND status = 'FINALIZADO' AND deletado_em IS NULL
$$;

CREATE OR REPLACE FUNCTION public.fmt_qtd(_v numeric, _un varchar) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(
    to_char(_v, CASE upper(_un) WHEN 'TON' THEN 'FM999G999G999G990D000' WHEN 'KG' THEN 'FM999G999G999G990' WHEN 'LT' THEN 'FM999G999G999G990' WHEN 'UND' THEN 'FM999G999G999G990' ELSE 'FM999G999G999G990D00' END),
    ',', '#'), '.', ','), '#', '.') || ' ' || upper(_un)
$$;

CREATE OR REPLACE FUNCTION public.trg_romaneio_status_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(current_setting('agroerp.via_funcao', true), '') = 'on' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('FINALIZADO','ESTORNADO') THEN
      RAISE EXCEPTION 'Finalização e estorno de romaneio só podem ser feitos pelas operações oficiais do sistema.';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.status IN ('FINALIZADO','ESTORNADO') AND NEW.status = 'CANCELADO' THEN
    RAISE EXCEPTION 'Romaneio finalizado não pode ser cancelado — utilize o estorno.';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND (NEW.status IN ('FINALIZADO','ESTORNADO') OR OLD.status IN ('FINALIZADO','ESTORNADO')) THEN
    RAISE EXCEPTION 'Finalização e estorno de romaneio só podem ser feitos pelas operações oficiais do sistema.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER romaneio_status_guard BEFORE INSERT OR UPDATE ON public.romaneios FOR EACH ROW EXECUTE FUNCTION public.trg_romaneio_status_guard();
