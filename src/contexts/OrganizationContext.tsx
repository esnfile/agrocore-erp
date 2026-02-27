import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { empresaService, filialService } from "@/lib/services";
import type { Empresa, Filial } from "@/lib/mock-data";

interface OrganizationContextType {
  empresas: Empresa[];
  filiais: Filial[];
  empresaAtual: Empresa | null;
  filialAtual: Filial | null;
  setEmpresaId: (id: string) => void;
  setFilialId: (id: string) => void;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [filialAtual, setFilialAtual] = useState<Filial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    empresaService.listar().then((list) => {
      setEmpresas(list);
      if (list.length > 0) {
        setEmpresaAtual(list[0]);
      }
      setLoading(false);
    });
  }, []);

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
      value={{ empresas, filiais, empresaAtual, filialAtual, setEmpresaId, setFilialId, loading }}
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
