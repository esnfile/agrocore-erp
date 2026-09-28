import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { definirSessaoAtual, type PerfilAcesso, type SessaoUsuario } from "@/lib/services";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  perfilUsuario: SessaoUsuario | null;
  perfil: PerfilAcesso | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<{ erro?: string }>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<{ erro?: string }>;
  sair: () => Promise<void>;
  definirContextoOrganizacional: (ctx: { grupoId: string; empresaId: string; filialId: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<SessaoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(async (u: User) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id),
    ]);

    const perfil: PerfilAcesso =
      (roles?.find((r) => r.role === "ADMINISTRADOR")?.role as PerfilAcesso) ??
      (roles?.find((r) => r.role === "OPERADOR")?.role as PerfilAcesso) ??
      "CONSULTA";

    const sessao: SessaoUsuario = {
      id: u.id,
      nome: profile?.nome || u.email?.split("@")[0] || "Usuário",
      email: profile?.email || u.email || "",
      perfil,
      grupoId: profile?.grupo_id || "",
      empresaId: profile?.empresa_id || "",
      filialId: profile?.filial_id || "",
      empresasPermitidas: profile?.empresas_permitidas ?? [],
      filiaisPermitidas: profile?.filiais_permitidas ?? [],
    };
    definirSessaoAtual(sessao);
    setPerfilUsuario(sessao);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          carregarPerfil(s.user).finally(() => setCarregando(false));
        }, 0);
      } else {
        definirSessaoAtual(null);
        setPerfilUsuario(null);
        setCarregando(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        carregarPerfil(s.user).finally(() => setCarregando(false));
      } else {
        setCarregando(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [carregarPerfil]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) return { erro: error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message };
    return {};
  }, []);

  const cadastrar = useCallback(async (nome: string, email: string, senha: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: nome.trim() },
      },
    });
    if (error) {
      if (error.message.includes("already registered")) return { erro: "Este e-mail já está cadastrado." };
      return { erro: error.message };
    }
    return {};
  }, []);

  const sair = useCallback(async () => {
    definirSessaoAtual(null);
    setPerfilUsuario(null);
    await supabase.auth.signOut();
  }, []);

  const definirContextoOrganizacional = useCallback(
    (ctx: { grupoId: string; empresaId: string; filialId: string }) => {
      setPerfilUsuario((atual) => {
        if (!atual) return atual;
        const atualizado = { ...atual, ...ctx };
        definirSessaoAtual(atualizado);
        return atualizado;
      });
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        perfilUsuario,
        perfil: perfilUsuario?.perfil ?? null,
        carregando,
        entrar,
        cadastrar,
        sair,
        definirContextoOrganizacional,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
