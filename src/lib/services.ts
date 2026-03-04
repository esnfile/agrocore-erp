// ============================================================
// AgroERP — Service Layer (mock, swap-ready)
// ============================================================
import {
  empresas as mockEmpresas,
  filiais as mockFiliais,
  grupos as mockGrupos,
  gruposPessoa as mockGruposPessoa,
  pessoas as mockPessoas,
  tiposProduto as mockTiposProduto,
  marcasProduto as mockMarcasProduto,
  divisoesProduto as mockDivisoesProduto,
  secoesProduto as mockSecoesProduto,
  gruposProduto as mockGruposProduto,
  subgruposProduto as mockSubgruposProduto,
  coeficientes as mockCoeficientes,
  coeficienteEmpresas as mockCoeficienteEmpresas,
  tabelasPreco as mockTabelasPreco,
  tabelaPrecoEmpresas as mockTabelaPrecoEmpresas,
  parametrosComerciais as mockParametrosComerciais,
  produtos as mockProdutos,
  produtoEmpresas as mockProdutoEmpresas,
  produtoEmpresaTabelasPreco as mockProdutoEmpresaTabelasPreco,
} from "./mock-data";
import type {
  Empresa, Filial, Grupo, GrupoPessoa, Pessoa,
  TipoProduto, MarcaProduto, DivisaoProduto, SecaoProduto, GrupoProduto, SubgrupoProduto,
  Coeficiente, CoeficienteEmpresa, TabelaPreco, TabelaPrecoEmpresa, ParametroComercial, AplicaSobre,
  Produto, ProdutoEmpresa, ProdutoEmpresaTabelaPreco, TipoBaixaEstoque,
} from "./mock-data";

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

// ============================================================
// Generic CRUD service factory for simple description+ativo tables
// ============================================================
interface SimpleEntity {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

function createSimpleCrudService<T extends SimpleEntity>(store: T[], prefix: string) {
  return {
    async listar(empresaId: string, filialId: string): Promise<T[]> {
      await delay();
      return store.filter((i) => i.deletadoEm === null && i.empresaId === empresaId && i.filialId === filialId);
    },
    async listarTodos(): Promise<T[]> {
      await delay();
      return store.filter((i) => i.deletadoEm === null);
    },
    async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
      await delay(100);
      const trimmed = descricao.trim().toLowerCase();
      return store.some(
        (i) => i.deletadoEm === null && i.empresaId === empresaId && i.filialId === filialId &&
          i.descricao.toLowerCase() === trimmed && i.id !== excludeId
      );
    },
    async salvar(
      data: Partial<T>,
      ctx: { grupoId: string; empresaId: string; filialId: string }
    ): Promise<T> {
      await delay(400);
      const now = new Date().toISOString();
      const userId = "u1";
      const existing = data.id ? store.find((i) => i.id === data.id && i.deletadoEm === null) : undefined;
      if (existing) {
        existing.descricao = (data.descricao ?? existing.descricao).trim();
        existing.ativo = data.ativo ?? existing.ativo;
        const extraKeys = Object.keys(data).filter(k => !['id','descricao','ativo','grupoId','empresaId','filialId','criadoEm','criadoPor','atualizadoEm','atualizadoPor','deletadoEm','deletadoPor'].includes(k));
        for (const key of extraKeys) {
          (existing as any)[key] = (data as any)[key];
        }
        existing.atualizadoEm = now;
        existing.atualizadoPor = userId;
        return existing;
      }
      const novo = {
        id: `${prefix}${Date.now()}`,
        grupoId: ctx.grupoId,
        empresaId: ctx.empresaId,
        filialId: ctx.filialId,
        descricao: (data.descricao ?? "").trim(),
        ativo: data.ativo ?? true,
        criadoEm: now,
        criadoPor: userId,
        atualizadoEm: now,
        atualizadoPor: userId,
        deletadoEm: null,
        deletadoPor: null,
      } as T;
      const extraKeys = Object.keys(data).filter(k => !['id','descricao','ativo','grupoId','empresaId','filialId'].includes(k));
      for (const key of extraKeys) {
        (novo as any)[key] = (data as any)[key];
      }
      store.push(novo);
      return novo;
    },
    async excluir(id: string): Promise<void> {
      await delay();
      const now = new Date().toISOString();
      const item = store.find((i) => i.id === id && i.deletadoEm === null);
      if (item) {
        item.deletadoEm = now;
        item.deletadoPor = "u1";
        item.atualizadoEm = now;
        item.atualizadoPor = "u1";
      }
    },
  };
}

export const tipoProdutoService = createSimpleCrudService<TipoProduto>(mockTiposProduto, "tp");
export const marcaProdutoService = createSimpleCrudService<MarcaProduto>(mockMarcasProduto, "mp");
export const divisaoProdutoService = createSimpleCrudService<DivisaoProduto>(mockDivisoesProduto, "dp");
export const secaoProdutoService = createSimpleCrudService<SecaoProduto>(mockSecoesProduto, "sp");
export const grupoProdutoService = createSimpleCrudService<GrupoProduto>(mockGruposProduto, "grp");
export const subgrupoProdutoService = createSimpleCrudService<SubgrupoProduto>(mockSubgruposProduto, "sgp");

// ============================================================
// Coeficientes
// ============================================================
export const coeficienteService = {
  async listar(grupoId: string): Promise<Coeficiente[]> {
    await delay();
    return mockCoeficientes.filter((c) => c.deletadoEm === null && c.grupoId === grupoId);
  },
  async descricaoExiste(descricao: string, grupoId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockCoeficientes.some(
      (c) => c.deletadoEm === null && c.grupoId === grupoId && c.descricao.toLowerCase() === t && c.id !== excludeId
    );
  },
  async salvar(data: Partial<Coeficiente>, grupoId: string): Promise<Coeficiente> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockCoeficientes.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: Coeficiente = {
      id: `coef${Date.now()}`, grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(), ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockCoeficientes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockCoeficientes.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = "u1"; c.atualizadoEm = now; c.atualizadoPor = "u1"; }
  },
};

export const coeficienteEmpresaService = {
  async listarPorCoeficiente(coeficienteId: string): Promise<CoeficienteEmpresa[]> {
    await delay();
    return mockCoeficienteEmpresas.filter((ce) => ce.deletadoEm === null && ce.coeficienteId === coeficienteId);
  },
  async salvar(data: Partial<CoeficienteEmpresa>, coeficienteId: string): Promise<CoeficienteEmpresa> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockCoeficienteEmpresas.find((ce) => ce.id === data.id && ce.deletadoEm === null) : undefined;
    if (existing) {
      existing.percentualCustoVariavel = data.percentualCustoVariavel ?? existing.percentualCustoVariavel;
      existing.percentualCustoFixo = data.percentualCustoFixo ?? existing.percentualCustoFixo;
      existing.percentualImpostos = data.percentualImpostos ?? existing.percentualImpostos;
      existing.aplicaSobre = data.aplicaSobre ?? existing.aplicaSobre;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    // check duplicate
    const dup = mockCoeficienteEmpresas.find(
      (ce) => ce.deletadoEm === null && ce.coeficienteId === coeficienteId && ce.empresaId === data.empresaId
    );
    if (dup) throw new Error("Empresa já vinculada a este coeficiente.");
    const novo: CoeficienteEmpresa = {
      id: `ce${Date.now()}`, coeficienteId, empresaId: data.empresaId!,
      percentualCustoVariavel: data.percentualCustoVariavel ?? 0,
      percentualCustoFixo: data.percentualCustoFixo ?? 0,
      percentualImpostos: data.percentualImpostos ?? 0,
      aplicaSobre: data.aplicaSobre ?? "CUSTO_BASE",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockCoeficienteEmpresas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const ce = mockCoeficienteEmpresas.find((ce) => ce.id === id && ce.deletadoEm === null);
    if (ce) { ce.deletadoEm = now; ce.deletadoPor = "u1"; ce.atualizadoEm = now; ce.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Tabela de Preço
// ============================================================
export const tabelaPrecoService = {
  async listar(grupoId: string): Promise<TabelaPreco[]> {
    await delay();
    return mockTabelasPreco.filter((t) => t.deletadoEm === null && t.grupoId === grupoId);
  },
  async descricaoExiste(descricao: string, grupoId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockTabelasPreco.some(
      (tp) => tp.deletadoEm === null && tp.grupoId === grupoId && tp.descricao.toLowerCase() === t && tp.id !== excludeId
    );
  },
  async salvar(data: Partial<TabelaPreco>, grupoId: string): Promise<TabelaPreco> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockTabelasPreco.find((t) => t.id === data.id && t.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: TabelaPreco = {
      id: `tpreco${Date.now()}`, grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(), ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockTabelasPreco.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockTabelasPreco.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = "u1"; t.atualizadoEm = now; t.atualizadoPor = "u1"; }
  },
};

export const tabelaPrecoEmpresaService = {
  async listarPorTabela(tabelaPrecoId: string): Promise<TabelaPrecoEmpresa[]> {
    await delay();
    return mockTabelaPrecoEmpresas.filter((t) => t.deletadoEm === null && t.tabelaPrecoId === tabelaPrecoId);
  },
  async salvar(data: Partial<TabelaPrecoEmpresa>, tabelaPrecoId: string): Promise<TabelaPrecoEmpresa> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockTabelaPrecoEmpresas.find((t) => t.id === data.id && t.deletadoEm === null) : undefined;
    if (existing) {
      existing.margemLucroPercentual = data.margemLucroPercentual ?? existing.margemLucroPercentual;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const dup = mockTabelaPrecoEmpresas.find(
      (t) => t.deletadoEm === null && t.tabelaPrecoId === tabelaPrecoId && t.empresaId === data.empresaId
    );
    if (dup) throw new Error("Empresa já vinculada a esta tabela de preço.");
    const novo: TabelaPrecoEmpresa = {
      id: `tpe${Date.now()}`, tabelaPrecoId, empresaId: data.empresaId!,
      margemLucroPercentual: data.margemLucroPercentual ?? 0,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockTabelaPrecoEmpresas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockTabelaPrecoEmpresas.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = "u1"; t.atualizadoEm = now; t.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Parâmetros Comerciais
// ============================================================
export const parametroComercialService = {
  async obterPorEmpresa(empresaId: string): Promise<ParametroComercial | null> {
    await delay();
    return mockParametrosComerciais.find((p) => p.deletadoEm === null && p.empresaId === empresaId) ?? null;
  },
};

// ============================================================
// Produtos
// ============================================================
export const produtoService = {
  async listar(grupoId: string): Promise<Produto[]> {
    await delay();
    return mockProdutos.filter((p) => p.deletadoEm === null && p.grupoId === grupoId);
  },
  async descricaoExiste(descricao: string, grupoId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockProdutos.some(
      (p) => p.deletadoEm === null && p.grupoId === grupoId && p.descricao.toLowerCase() === t && p.id !== excludeId
    );
  },
  async salvar(data: Partial<Produto>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Produto> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockProdutos.find((p) => p.id === data.id && p.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: "u1", deletadoEm: null, deletadoPor: null,
      });
      return existing;
    }
    const novo: Produto = {
      id: `prod${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      codigoBarras: data.codigoBarras ?? "",
      descricao: (data.descricao ?? "").trim(),
      aplicacao: data.aplicacao ?? "",
      tipoBaixaEstoque: data.tipoBaixaEstoque ?? "INDIVIDUAL",
      quantidadeEmbalagemCompra: data.quantidadeEmbalagemCompra ?? 1,
      quantidadeEmbalagemVenda: data.quantidadeEmbalagemVenda ?? 1,
      divisaoProdutoId: data.divisaoProdutoId ?? "",
      secaoProdutoId: data.secaoProdutoId ?? "",
      grupoProdutoId: data.grupoProdutoId ?? "",
      subgrupoProdutoId: data.subgrupoProdutoId ?? "",
      marcaProdutoId: data.marcaProdutoId ?? null,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockProdutos.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = "u1"; p.atualizadoEm = now; p.atualizadoPor = "u1"; }
  },
};

export const produtoEmpresaService = {
  async listarPorProduto(produtoId: string): Promise<ProdutoEmpresa[]> {
    await delay();
    return mockProdutoEmpresas.filter((pe) => pe.deletadoEm === null && pe.produtoId === produtoId);
  },
  async salvar(data: Partial<ProdutoEmpresa>, produtoId: string): Promise<ProdutoEmpresa> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockProdutoEmpresas.find((pe) => pe.id === data.id && pe.deletadoEm === null) : undefined;
    if (existing) {
      existing.coeficienteEmpresaId = data.coeficienteEmpresaId ?? existing.coeficienteEmpresaId;
      existing.custoBase = data.custoBase ?? existing.custoBase;
      existing.custoCalculado = data.custoCalculado ?? existing.custoCalculado;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const dup = mockProdutoEmpresas.find(
      (pe) => pe.deletadoEm === null && pe.produtoId === produtoId && pe.empresaId === data.empresaId
    );
    if (dup) throw new Error("Empresa já vinculada a este produto.");
    const novo: ProdutoEmpresa = {
      id: `pe${Date.now()}`, produtoId, empresaId: data.empresaId!,
      coeficienteEmpresaId: data.coeficienteEmpresaId ?? "",
      custoBase: data.custoBase ?? 0, custoCalculado: data.custoCalculado ?? 0,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoEmpresas.push(novo);
    return novo;
  },
  async excluirPorProduto(produtoId: string): Promise<void> {
    const now = new Date().toISOString();
    mockProdutoEmpresas.filter((pe) => pe.produtoId === produtoId && pe.deletadoEm === null).forEach((pe) => {
      pe.deletadoEm = now; pe.deletadoPor = "u1";
    });
  },
};

export const produtoEmpresaTabelaPrecoService = {
  async listarPorProdutoEmpresa(produtoEmpresaId: string): Promise<ProdutoEmpresaTabelaPreco[]> {
    await delay();
    return mockProdutoEmpresaTabelasPreco.filter((t) => t.deletadoEm === null && t.produtoEmpresaId === produtoEmpresaId);
  },
  async salvar(data: Partial<ProdutoEmpresaTabelaPreco>, produtoEmpresaId: string): Promise<ProdutoEmpresaTabelaPreco> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockProdutoEmpresaTabelasPreco.find((t) => t.id === data.id && t.deletadoEm === null) : undefined;
    if (existing) {
      existing.precoCalculado = data.precoCalculado ?? existing.precoCalculado;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: ProdutoEmpresaTabelaPreco = {
      id: `petp${Date.now()}`, produtoEmpresaId,
      tabelaPrecoEmpresaId: data.tabelaPrecoEmpresaId ?? "",
      precoCalculado: data.precoCalculado ?? 0,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoEmpresaTabelasPreco.push(novo);
    return novo;
  },
};
