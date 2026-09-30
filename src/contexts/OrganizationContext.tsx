import React, { createContext, useContext, useState, useEffect, useCallback } from "react"; // v3
import { empresaService, filialService, grupoService } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import type { Empresa, Filial, Grupo } from "@/lib/mock-data";

interface OrganizationContextType {
  grupos: Grupo[];
  empresas: Empresa[];
  filiais: Filial[];
  grupoAtual: Grupo | null;
  empresaAtual: Empresa | null;
  filialAtual: Filial | null;
  setGrupoId: (id: string) => void;
  setEmpresaId: (id: string) => void;
  setFilialId: (id: string) => void;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { perfilUsuario, definirContextoOrganizacional } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [grupoAtual, setGrupoAtual] = useState<Grupo | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [filialAtual, setFilialAtual] = useState<Filial | null>(null);
  const [loading, setLoading] = useState(true);

  // Empresas/filiais permitidas para o usuário logado. Lista vazia = sem
  // restrição cadastrada (todas as opções do grupo ficam disponíveis).
  const empresasPermitidas = perfilUsuario?.empresasPermitidas ?? [];
  const filiaisPermitidas = perfilUsuario?.filiaisPermitidas ?? [];

  // Load grupos on mount
  useEffect(() => {
    grupoService.listar().then((list) => {
      setGrupos(list);
      if (list.length > 0) setGrupoAtual(list[0]);
      setLoading(false);
    });
  }, []);

  // When grupo changes, reload empresas (limitadas às permitidas)
  useEffect(() => {
    if (!grupoAtual) {
      setEmpresas([]);
      setEmpresaAtual(null);
      setFiliais([]);
      setFilialAtual(null);
      return;
    }
    // Catálogo de unidades/produtos do banco (conversões síncronas nas telas)
    carregarCatalogoProdutos().catch((e) => console.error("Falha ao carregar produtos:", e));
    empresaService.listar(grupoAtual.id).then((list) => {
      const permitidas = empresasPermitidas.length > 0
        ? list.filter((e) => empresasPermitidas.includes(e.id))
        : list;
      setEmpresas(permitidas);
      setEmpresaAtual(permitidas.length > 0 ? permitidas[0] : null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoAtual, perfilUsuario?.id]);

  // When empresa changes, reload filiais (limitadas às permitidas)
  useEffect(() => {
    if (!empresaAtual) {
      setFiliais([]);
      setFilialAtual(null);
      return;
    }
    filialService.listarPorEmpresa(empresaAtual.id).then((list) => {
      const permitidas = filiaisPermitidas.length > 0
        ? list.filter((f) => filiaisPermitidas.includes(f.id))
        : list;
      setFiliais(permitidas);
      setFilialAtual(permitidas.length > 0 ? permitidas[0] : null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaAtual, perfilUsuario?.id]);

  // O contexto selecionado alimenta a sessão usada pela camada de serviços.
  useEffect(() => {
    if (!perfilUsuario) return;
    definirContextoOrganizacional({
      grupoId: grupoAtual?.id ?? "",
      empresaId: empresaAtual?.id ?? "",
      filialId: filialAtual?.id ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoAtual?.id, empresaAtual?.id, filialAtual?.id, perfilUsuario?.id]);

  const setGrupoId = useCallback(
    (id: string) => {
      const g = grupos.find((g) => g.id === id);
      if (g) setGrupoAtual(g);
    },
    [grupos]
  );

  const setEmpresaId = useCallback(
    (id: string) => {
      const emp = empresas.find((e) => e.id === id);
      if (emp) setEmpresaAtual(emp);
    },
    [empresas]
  );

  const setFilialId = useCallback(
    (id: string) => {
      const fil = filiais.find((f) => f.id === id);
      if (fil) setFilialAtual(fil);
    },
    [filiais]
  );

  return (
    <OrganizationContext.Provider
      value={{
        grupos, empresas, filiais,
        grupoAtual, empresaAtual, filialAtual,
        setGrupoId, setEmpresaId, setFilialId,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}
