// ============================================================
// AgroERP — Service Layer (mock, swap-ready)
// ============================================================
import { empresas as mockEmpresas, filiais as mockFiliais, grupos as mockGrupos } from "./mock-data";
import type { Empresa, Filial, Grupo } from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ---- Grupos ----
export const grupoService = {
  async listar(): Promise<Grupo[]> {
    await delay();
    return mockGrupos.filter((g) => g.ativo);
  },
  async obterPorId(id: string): Promise<Grupo | undefined> {
    await delay();
    return mockGrupos.find((g) => g.id === id);
  },
  async salvar(data: Partial<Grupo>): Promise<Grupo> {
    await delay(400);
    const existing = data.id ? mockGrupos.find((g) => g.id === data.id) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: new Date().toISOString() });
      return existing;
    }
    const novo: Grupo = {
      id: `g${Date.now()}`,
      nome: data.nome ?? "",
      descricao: data.descricao ?? "",
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    mockGrupos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const g = mockGrupos.find((g) => g.id === id);
    if (g) g.ativo = false;
  },
};

// ---- Empresas ----
export const empresaService = {
  async listar(grupoId?: string): Promise<Empresa[]> {
    await delay();
    let list = mockEmpresas.filter((e) => e.ativo);
    if (grupoId) list = list.filter((e) => e.grupoId === grupoId);
    return list;
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
  async listar(grupoId?: string): Promise<Filial[]> {
    await delay();
    let list = mockFiliais.filter((f) => f.ativo);
    if (grupoId) list = list.filter((f) => f.grupoId === grupoId);
    return list;
  },
  async listarPorEmpresa(empresaId: string): Promise<Filial[]> {
    await delay();
    return mockFiliais.filter((f) => f.empresaId === empresaId && f.ativo);
  },
  async obterPorId(id: string): Promise<Filial | undefined> {
    await delay();
    return mockFiliais.find((f) => f.id === id);
  },
  async salvar(data: Partial<Filial>): Promise<Filial> {
    await delay(400);
    const existing = data.id ? mockFiliais.find((f) => f.id === data.id) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: new Date().toISOString() });
      return existing;
    }
    const nova: Filial = {
      id: `f${Date.now()}`,
      grupoId: data.grupoId ?? "g1",
      empresaId: data.empresaId ?? "",
      nome: data.nome ?? "",
      cnpj: data.cnpj ?? "",
      endereco: data.endereco ?? "",
      cidade: data.cidade ?? "",
      uf: data.uf ?? "",
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    mockFiliais.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const f = mockFiliais.find((f) => f.id === id);
    if (f) f.ativo = false;
  },
};
