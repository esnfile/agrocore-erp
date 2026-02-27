// ============================================================
// AgroERP — Service Layer (mock, swap-ready)
// ============================================================
import { empresas as mockEmpresas, filiais as mockFiliais, grupos as mockGrupos } from "./mock-data";
import type { Empresa, Filial, Grupo } from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ---- Empresas ----
export const empresaService = {
  async listar(): Promise<Empresa[]> {
    await delay();
    return mockEmpresas.filter((e) => e.ativo);
  },
  async obterPorId(id: string): Promise<Empresa | undefined> {
    await delay();
    return mockEmpresas.find((e) => e.id === id);
  },
  async salvar(data: Partial<Empresa>): Promise<Empresa> {
    await delay(400);
    const existing = data.id ? mockEmpresas.find((e) => e.id === data.id) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: new Date().toISOString() });
      return existing;
    }
    const nova: Empresa = {
      id: `e${Date.now()}`,
      grupoId: data.grupoId ?? "g1",
      razaoSocial: data.razaoSocial ?? "",
      nomeFantasia: data.nomeFantasia ?? "",
      cnpj: data.cnpj ?? "",
      inscricaoEstadual: data.inscricaoEstadual ?? "",
      email: data.email ?? "",
      telefone: data.telefone ?? "",
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    mockEmpresas.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const emp = mockEmpresas.find((e) => e.id === id);
    if (emp) emp.ativo = false;
  },
};

// ---- Filiais ----
export const filialService = {
  async listarPorEmpresa(empresaId: string): Promise<Filial[]> {
    await delay();
    return mockFiliais.filter((f) => f.empresaId === empresaId && f.ativo);
  },
};

// ---- Grupos ----
export const grupoService = {
  async listar(): Promise<Grupo[]> {
    await delay();
    return mockGrupos.filter((g) => g.ativo);
  },
};
