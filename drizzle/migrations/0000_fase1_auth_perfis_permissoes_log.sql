-- ============================================================
-- FASE 1 — Autenticação, perfis, permissões e log de autorizações
-- NÃO cria tabelas de domínio (contratos/romaneios/estoque) — Fase 2.
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('ADMINISTRADOR', 'OPERADOR', 'CONSULTA');

-- ---- Perfis (dados do usuário + vínculo à tríade organizacional) ----
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  grupo_id TEXT NOT NULL DEFAULT 'g1',
  empresa_id TEXT NOT NULL DEFAULT 'e1',
  filial_id TEXT NOT NULL DEFAULT 'f1',
  empresas_permitidas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  filiais_permitidas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---- Perfis de acesso (roles) em tabela separada ----
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ---- Log de autorizações de supervisor ----
CREATE TABLE public.autorizacoes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario_nome TEXT NOT NULL DEFAULT '',
  acao TEXT NOT NULL,
  registro_tipo TEXT NOT NULL DEFAULT '',
  registro_id TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  justificativa TEXT NOT NULL DEFAULT '',
  resultado TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_autorizacoes_log_criado_em ON public.autorizacoes_log (criado_em DESC);

GRANT SELECT, INSERT ON public.autorizacoes_log TO authenticated;
GRANT ALL ON public.autorizacoes_log TO service_role;
ALTER TABLE public.autorizacoes_log ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado grava o próprio rastro (não pode gravar por outro).
CREATE POLICY "autorizacoes_log_insert_own" ON public.autorizacoes_log
  FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
-- Leitura: o próprio rastro, ou tudo se for Administrador.
CREATE POLICY "autorizacoes_log_select" ON public.autorizacoes_log
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'ADMINISTRADOR'));

-- ---- Criação automática de perfil + role no cadastro ----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primeiro BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO primeiro;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN primeiro THEN 'ADMINISTRADOR'::public.app_role ELSE 'CONSULTA'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();