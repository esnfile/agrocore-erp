import React, { createContext, useContext, useState, useEffect, useCallback } from "react"; // v2
import { empresaService, filialService, grupoService } from "@/lib/services";
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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [grupoAtual, setGrupoAtual] = useState<Grupo | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [filialAtual, setFilialAtual] = useState<Filial | null>(null);
  const [loading, setLoading] = useState(true);

  // Load grupos on mount
  useEffect(() => {
    grupoService.listar().then((list) => {
      setGrupos(list);
      if (list.length > 0) setGrupoAtual(list[0]);
      setLoading(false);
    });
  }, []);

  // When grupo changes, reload empresas
  useEffect(() => {
    if (!grupoAtual) {
      setEmpresas([]);
      setEmpresaAtual(null);
      setFiliais([]);
      setFilialAtual(null);
      return;
    }
    empresaService.listar(grupoAtual.id).then((list) => {
      setEmpresas(list);
      setEmpresaAtual(list.length > 0 ? list[0] : null);
    });
  }, [grupoAtual]);

  // When empresa changes, reload filiais
  useEffect(() => {
    if (!empresaAtual) {
      setFiliais([]);
      setFilialAtual(null);
      return;
    }
    filialService.listarPorEmpresa(empresaAtual.id).then((list) => {
      setFiliais(list);
      setFilialAtual(list.length > 0 ? list[0] : null);
    });
  }, [empresaAtual]);

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
