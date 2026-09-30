ALTER TABLE public.grupos ADD COLUMN IF NOT EXISTS descricao text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS descricao text NOT NULL DEFAULT '';
ALTER TABLE public.empresas ALTER COLUMN cpf_cnpj DROP NOT NULL;
ALTER TABLE public.filiais ADD COLUMN IF NOT EXISTS matriz_filial varchar(10) NOT NULL DEFAULT 'FILIAL',
  ADD COLUMN IF NOT EXISTS email varchar(320), ADD COLUMN IF NOT EXISTS telefone varchar(20), ADD COLUMN IF NOT EXISTS complemento varchar(100);
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS tipo_pessoa varchar(2) NOT NULL DEFAULT 'PJ',
  ADD COLUMN IF NOT EXISTS relacoes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nome_fantasia varchar(200),
  ADD COLUMN IF NOT EXISTS data_nascimento_abertura date,
  ADD COLUMN IF NOT EXISTS sexo varchar(10),
  ADD COLUMN IF NOT EXISTS grupo_pessoa_id uuid,
  ADD COLUMN IF NOT EXISTS enderecos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contatos jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.centros_custo ALTER COLUMN codigo SET DEFAULT '';

CREATE TABLE public.grupos_pessoa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL REFERENCES public.grupos(id),
  descricao varchar(150) NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(), criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT now(), atualizado_por uuid,
  deletado_em timestamptz, deletado_por uuid
);
GRANT SELECT, INSERT, UPDATE ON public.grupos_pessoa TO authenticated;
GRANT ALL ON public.grupos_pessoa TO service_role;
ALTER TABLE public.grupos_pessoa ENABLE ROW LEVEL SECURITY;
CREATE POLICY grupos_pessoa_select ON public.grupos_pessoa FOR SELECT TO authenticated USING (grupo_id = public.usuario_grupo_id());
CREATE POLICY grupos_pessoa_insert ON public.grupos_pessoa FOR INSERT TO authenticated WITH CHECK (grupo_id = public.usuario_grupo_id() AND public.pode_gravar());
CREATE POLICY grupos_pessoa_update ON public.grupos_pessoa FOR UPDATE TO authenticated USING (grupo_id = public.usuario_grupo_id() AND public.pode_gravar()) WITH CHECK (grupo_id = public.usuario_grupo_id());
ALTER TABLE public.pessoas ADD CONSTRAINT pessoas_grupo_pessoa_fk FOREIGN KEY (grupo_pessoa_id) REFERENCES public.grupos_pessoa(id);