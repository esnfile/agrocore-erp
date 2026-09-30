CREATE TABLE public.tipos_produto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  descricao varchar(100) NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(), criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT now(), atualizado_por uuid,
  deletado_em timestamptz, deletado_por uuid);
GRANT SELECT, INSERT, UPDATE ON public.tipos_produto TO authenticated;
GRANT ALL ON public.tipos_produto TO service_role;
ALTER TABLE public.tipos_produto ENABLE ROW LEVEL SECURITY;
CREATE POLICY tipos_produto_select ON public.tipos_produto FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY tipos_produto_insert ON public.tipos_produto FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.pode_gravar());
CREATE POLICY tipos_produto_update ON public.tipos_produto FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.pode_gravar()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE UNIQUE INDEX ux_tipos_produto_desc ON public.tipos_produto (grupo_id, lower(descricao)) WHERE deletado_em IS NULL;

CREATE TABLE public.marcas_produto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  descricao varchar(100) NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(), criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT now(), atualizado_por uuid,
  deletado_em timestamptz, deletado_por uuid);
GRANT SELECT, INSERT, UPDATE ON public.marcas_produto TO authenticated;
GRANT ALL ON public.marcas_produto TO service_role;
ALTER TABLE public.marcas_produto ENABLE ROW LEVEL SECURITY;
CREATE POLICY marcas_produto_select ON public.marcas_produto FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY marcas_produto_insert ON public.marcas_produto FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.pode_gravar());
CREATE POLICY marcas_produto_update ON public.marcas_produto FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.pode_gravar()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE UNIQUE INDEX ux_marcas_produto_desc ON public.marcas_produto (grupo_id, lower(descricao)) WHERE deletado_em IS NULL;

CREATE TABLE public.categorias_produto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  descricao varchar(100) NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(), criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT now(), atualizado_por uuid,
  deletado_em timestamptz, deletado_por uuid);
GRANT SELECT, INSERT, UPDATE ON public.categorias_produto TO authenticated;
GRANT ALL ON public.categorias_produto TO service_role;
ALTER TABLE public.categorias_produto ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorias_produto_select ON public.categorias_produto FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY categorias_produto_insert ON public.categorias_produto FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.pode_gravar());
CREATE POLICY categorias_produto_update ON public.categorias_produto FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.pode_gravar()) WITH CHECK (grupo_id = public.usuario_grupo_id());
CREATE UNIQUE INDEX ux_categorias_produto_desc ON public.categorias_produto (grupo_id, lower(descricao)) WHERE deletado_em IS NULL;

ALTER TABLE public.produtos
  ADD COLUMN tipo_produto_id uuid REFERENCES public.tipos_produto(id),
  ADD COLUMN marca_id uuid REFERENCES public.marcas_produto(id),
  ADD COLUMN categoria_id uuid REFERENCES public.categorias_produto(id),
  ADD COLUMN codigo_barras varchar(50),
  ADD COLUMN aplicacao text,
  ADD COLUMN tipo_baixa_estoque varchar(12) NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN unidade_entrada_padrao varchar(10),
  ADD COLUMN unidade_saida_padrao varchar(10),
  ADD COLUMN preco_referencia numeric(18,6);

COMMENT ON COLUMN public.produtos.unidade_entrada_padrao IS 'Default de preenchimento (romaneio). NUNCA fonte de conversao - fator so em produto_unidades.';
COMMENT ON COLUMN public.produtos.unidade_saida_padrao IS 'Default de preenchimento (contrato/venda). NUNCA fonte de conversao.';
COMMENT ON COLUMN public.produtos.preco_referencia IS 'Apenas referencia para pre-preencher contrato; nunca verdade financeira.';
COMMENT ON COLUMN public.unidades_medida.fator_universal_base IS 'DEPRECATED: unidade = descricao + tipo. Fator vive so em produto_unidades (contra a base).';