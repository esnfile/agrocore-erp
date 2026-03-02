// ============================================================
// AgroERP — Service Layer (mock, swap-ready)
// ============================================================
import {
  empresas as mockEmpresas,
  filiais as mockFiliais,
  grupos as mockGrupos,
  gruposPessoa as mockGruposPessoa,
  pessoas as mockPessoas,
} from "./mock-data";
import type { Empresa, Filial, Grupo, GrupoPessoa, Pessoa } from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ---- Grupos ----
export const grupoService = {
  async listar(): Promise<Grupo[]> {
    await delay();
    return mockGrupos.filter((g) => g.deletadoEm === null);
  },
  async obterPorId(id: string): Promise<Grupo | undefined> {
    await delay();
    return mockGrupos.find((g) => g.id === id && g.deletadoEm === null);
  },
  async salvar(data: Partial<Grupo>): Promise<Grupo> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";
    const existing = data.id ? mockGrupos.find((g) => g.id === data.id && g.deletadoEm === null) : undefined;
    if (existing) {
      existing.nome = (data.nome ?? existing.nome).trim();
      existing.atualizadoEm = now;
      existing.atualizadoPor = userId;
      return existing;
    }
    const novo: Grupo = {
      id: `g${Date.now()}`,
      nome: (data.nome ?? "").trim(),
      descricao: data.descricao ?? "",
      ativo: true,
      criadoEm: now,
      criadoPor: userId,
      atualizadoEm: now,
      atualizadoPor: userId,
      deletadoEm: null,
      deletadoPor: null,
    };
    mockGrupos.push(novo);
    return novo;
  },
  async nomeExiste(nome: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const trimmed = nome.trim().toLowerCase();
    return mockGrupos.some(
      (g) => g.deletadoEm === null && g.nome.toLowerCase() === trimmed && g.id !== excludeId
    );
  },
  async possuiEmpresas(id: string): Promise<boolean> {
    await delay(100);
    return mockEmpresas.some((e) => e.grupoId === id && e.deletadoEm === null);
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const g = mockGrupos.find((g) => g.id === id && g.deletadoEm === null);
    if (g) {
      g.deletadoEm = now;
      g.deletadoPor = "u1";
      g.atualizadoEm = now;
      g.atualizadoPor = "u1";
    }
  },
};

// ---- Empresas ----
export const empresaService = {
  async listar(grupoId?: string): Promise<Empresa[]> {
    await delay();
    let list = mockEmpresas.filter((e) => e.deletadoEm === null);
    if (grupoId) list = list.filter((e) => e.grupoId === grupoId);
    return list;
  },
  async obterPorId(id: string): Promise<Empresa | undefined> {
    await delay();
    return mockEmpresas.find((e) => e.id === id);
  },
  async salvar(data: Partial<Empresa>): Promise<Empresa> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";
    const existing = data.id ? mockEmpresas.find((e) => e.id === data.id && e.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: userId });
      return existing;
    }
    const nova: Empresa = {
      id: `e${Date.now()}`,
      grupoId: data.grupoId ?? "g1",
      razaoSocial: data.razaoSocial ?? "",
      nomeFantasia: data.nomeFantasia ?? "",
      tipoPessoa: data.tipoPessoa ?? "PJ",
      cpfCnpj: data.cpfCnpj ?? "",
      inscricaoEstadual: data.inscricaoEstadual ?? "",
      email: data.email ?? "",
      telefone: data.telefone ?? "",
      ativo: true,
      criadoEm: now,
      criadoPor: userId,
      atualizadoEm: now,
      atualizadoPor: userId,
      deletadoEm: null,
      deletadoPor: null,
    };
    mockEmpresas.push(nova);
    return nova;
  },
  async possuiFiliais(id: string): Promise<boolean> {
    await delay(100);
    return mockFiliais.some((f) => f.empresaId === id && f.deletadoEm === null);
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const emp = mockEmpresas.find((e) => e.id === id && e.deletadoEm === null);
    if (emp) {
      emp.deletadoEm = now;
      emp.deletadoPor = "u1";
      emp.atualizadoEm = now;
      emp.atualizadoPor = "u1";
    }
  },
};

// ---- Filiais ----
export const filialService = {
  async listar(): Promise<Filial[]> {
    await delay();
    return mockFiliais.filter((f) => f.deletadoEm === null);
  },
  async listarPorEmpresa(empresaId: string): Promise<Filial[]> {
    await delay();
    return mockFiliais.filter((f) => f.empresaId === empresaId && f.deletadoEm === null);
  },
  async obterPorId(id: string): Promise<Filial | undefined> {
    await delay();
    return mockFiliais.find((f) => f.id === id && f.deletadoEm === null);
  },
  async cpfCnpjExiste(cpfCnpj: string, empresaId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const trimmed = cpfCnpj.trim();
    return mockFiliais.some(
      (f) => f.deletadoEm === null && f.empresaId === empresaId && f.cpfCnpj === trimmed && f.id !== excludeId
    );
  },
  async possuiMovimentacoes(_id: string): Promise<boolean> {
    await delay(100);
    return false;
  },
  async salvar(data: Partial<Filial>): Promise<Filial> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";
    const existing = data.id ? mockFiliais.find((f) => f.id === data.id && f.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: userId });
      return existing;
    }
    const nova: Filial = {
      id: `f${Date.now()}`,
      empresaId: data.empresaId ?? "",
      nomeRazao: (data.nomeRazao ?? "").trim(),
      cpfCnpj: (data.cpfCnpj ?? "").trim(),
      inscricaoEstadual: (data.inscricaoEstadual ?? "").trim(),
      endereco: (data.endereco ?? "").trim(),
      numeroKm: (data.numeroKm ?? "").trim(),
      bairro: (data.bairro ?? "").trim(),
      cep: (data.cep ?? "").trim(),
      cidade: (data.cidade ?? "").trim(),
      estado: (data.estado ?? "").trim(),
      ativo: data.ativo ?? true,
      criadoEm: now,
      criadoPor: userId,
      atualizadoEm: now,
      atualizadoPor: userId,
      deletadoEm: null,
      deletadoPor: null,
    };
    mockFiliais.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const f = mockFiliais.find((f) => f.id === id && f.deletadoEm === null);
    if (f) {
      f.deletadoEm = now;
      f.deletadoPor = "u1";
      f.atualizadoEm = now;
      f.atualizadoPor = "u1";
    }
  },
};

// ---- Grupo de Pessoas ----
export const grupoPessoaService = {
  async listar(empresaId: string, filialId: string): Promise<GrupoPessoa[]> {
    await delay();
    return mockGruposPessoa.filter(
      (gp) => gp.deletadoEm === null && gp.empresaId === empresaId && gp.filialId === filialId
    );
  },
  async listarTodos(): Promise<GrupoPessoa[]> {
    await delay();
    return mockGruposPessoa.filter((gp) => gp.deletadoEm === null);
  },
  async nomeExiste(nome: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const trimmed = nome.trim().toLowerCase();
    return mockGruposPessoa.some(
      (gp) =>
        gp.deletadoEm === null &&
        gp.empresaId === empresaId &&
        gp.filialId === filialId &&
        gp.descGrupoPessoa.toLowerCase() === trimmed &&
        gp.id !== excludeId
    );
  },
  async salvar(
    data: Partial<GrupoPessoa>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<GrupoPessoa> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";
    const existing = data.id
      ? mockGruposPessoa.find((gp) => gp.id === data.id && gp.deletadoEm === null)
      : undefined;
    if (existing) {
      existing.descGrupoPessoa = (data.descGrupoPessoa ?? existing.descGrupoPessoa).trim();
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = userId;
      return existing;
    }
    const novo: GrupoPessoa = {
      id: `gp${Date.now()}`,
      grupoId: ctx.grupoId,
      empresaId: ctx.empresaId,
      filialId: ctx.filialId,
      descGrupoPessoa: (data.descGrupoPessoa ?? "").trim(),
      ativo: data.ativo ?? true,
      criadoEm: now,
      criadoPor: userId,
      atualizadoEm: now,
      atualizadoPor: userId,
      deletadoEm: null,
      deletadoPor: null,
    };
    mockGruposPessoa.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const gp = mockGruposPessoa.find((gp) => gp.id === id && gp.deletadoEm === null);
    if (gp) {
      gp.deletadoEm = now;
      gp.deletadoPor = "u1";
      gp.atualizadoEm = now;
      gp.atualizadoPor = "u1";
    }
  },
  async possuiPessoas(id: string): Promise<boolean> {
    await delay(100);
    return mockPessoas.some((p) => p.grupoPessoaId === id && p.deletadoEm === null);
  },
};

// ---- Pessoas ----
export const pessoaService = {
  async listar(
    empresaId: string,
    filialId: string,
    filtros?: {
      nome?: string;
      cpfCnpj?: string;
      tipoPessoa?: string;
      relacaoComercial?: string;
      status?: string;
    }
  ): Promise<Pessoa[]> {
    await delay();
    let list = mockPessoas.filter(
      (p) => p.deletadoEm === null && p.empresaId === empresaId && p.filialId === filialId
    );
    if (filtros?.nome) {
      const term = filtros.nome.toLowerCase();
      list = list.filter((p) => p.nomeRazao.toLowerCase().includes(term));
    }
    if (filtros?.cpfCnpj) {
      const term = filtros.cpfCnpj.toLowerCase();
      list = list.filter((p) => p.cpfCnpj.toLowerCase().includes(term));
    }
    if (filtros?.tipoPessoa) {
      list = list.filter((p) => p.tipoPessoa === filtros.tipoPessoa);
    }
    if (filtros?.relacaoComercial) {
      list = list.filter((p) => p.relacaoComercial.includes(filtros.relacaoComercial!));
    }
    if (filtros?.status) {
      const isAtivo = filtros.status === "ativo";
      list = list.filter((p) => p.ativo === isAtivo);
    }
    return list;
  },
  async cpfCnpjExiste(cpfCnpj: string, empresaId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const trimmed = cpfCnpj.trim();
    return mockPessoas.some(
      (p) => p.deletadoEm === null && p.empresaId === empresaId && p.cpfCnpj === trimmed && p.id !== excludeId
    );
  },
  async salvar(
    data: Partial<Pessoa>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<Pessoa> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";
    const existing = data.id
      ? mockPessoas.find((p) => p.id === data.id && p.deletadoEm === null)
      : undefined;
    if (existing) {
      Object.assign(existing, data, {
        grupoId: existing.grupoId,
        empresaId: existing.empresaId,
        filialId: existing.filialId,
        criadoEm: existing.criadoEm,
        criadoPor: existing.criadoPor,
        atualizadoEm: now,
        atualizadoPor: userId,
        deletadoEm: null,
        deletadoPor: null,
      });
      return existing;
    }
    const nova: Pessoa = {
      id: `p${Date.now()}`,
      grupoId: ctx.grupoId,
      empresaId: ctx.empresaId,
      filialId: ctx.filialId,
      tipoPessoa: data.tipoPessoa ?? "PF",
      grupoPessoaId: data.grupoPessoaId ?? "",
      relacaoComercial: data.relacaoComercial ?? [],
      nomeRazao: (data.nomeRazao ?? "").trim(),
      dataNascimentoAbertura: data.dataNascimentoAbertura ?? "",
      cpfCnpj: (data.cpfCnpj ?? "").trim(),
      rgIe: (data.rgIe ?? "").trim(),
      nomeFantasia: (data.nomeFantasia ?? "").trim(),
      sexo: data.sexo ?? "",
      ativo: data.ativo ?? true,
      enderecos: data.enderecos ?? [],
      contatos: data.contatos ?? [],
      criadoEm: now,
      criadoPor: userId,
      atualizadoEm: now,
      atualizadoPor: userId,
      deletadoEm: null,
      deletadoPor: null,
    };
    mockPessoas.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockPessoas.find((p) => p.id === id && p.deletadoEm === null);
    if (p) {
      p.deletadoEm = now;
      p.deletadoPor = "u1";
      p.atualizadoEm = now;
      p.atualizadoPor = "u1";
    }
  },
};
