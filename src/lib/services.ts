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
  unidadesMedida as mockUnidadesMedida,
  pontosEstoque as mockPontosEstoque,
  estoques as mockEstoques,
  movimentacoesEstoque as mockMovimentacoesEstoque,
  moedas as mockMoedas,
  cotacoesMoeda as mockCotacoesMoeda,
  pontoEstoqueTiposProduto as mockPontoEstoqueTiposProduto,
  contratos as mockContratos,
  contratoEntregas as mockContratoEntregas,
  contratoFixacoes as mockContratoFixacoes,
  condicaoDescontoModelos as mockCondicaoDescontoModelos,
  condicaoDescontoModeloItens as mockCondicaoDescontoModeloItens,
  contratoCondicoes as mockContratoCondicoes,
  classificacaoTipos as mockClassificacaoTipos,
  produtoClassificacoes as mockProdutoClassificacoes,
  classificacaoDescontos as mockClassificacaoDescontos,
  romaneioClassificacoes as mockRomaneioClassificacoes,
} from "./mock-data";
import type {
  Empresa, Filial, Grupo, GrupoPessoa, Pessoa,
  TipoProduto, MarcaProduto, DivisaoProduto, SecaoProduto, GrupoProduto, SubgrupoProduto,
  Coeficiente, CoeficienteEmpresa, TabelaPreco, TabelaPrecoEmpresa, ParametroComercial, AplicaSobre,
  Produto, ProdutoEmpresa, ProdutoEmpresaTabelaPreco, TipoBaixaEstoque,
  UnidadeMedida, TipoUnidadeMedida,
  PontoEstoque, TipoPontoEstoque, Estoque, MovimentacaoEstoque, TipoMovimentoEstoque,
  Moeda, CotacaoMoeda, PontoEstoqueTipoProduto,
  Contrato, ContratoEntrega, ContratoFixacao, TipoContrato, TipoPreco, StatusContrato,
  CondicaoDescontoModelo, CondicaoDescontoModeloItem, ContratoCondicao, TipoCondicaoDesconto,
  ClassificacaoTipo, UnidadeClassificacao, ProdutoClassificacao, ClassificacaoDesconto, RomaneioClassificacao,
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
      tipoProdutoId: data.tipoProdutoId ?? "",
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
      unidadeBaseId: data.unidadeBaseId ?? "",
      unidadeCompraId: data.unidadeCompraId ?? "",
      unidadeVendaId: data.unidadeVendaId ?? "",
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

// ============================================================
// Unidade de Medida
// ============================================================
export const unidadeMedidaService = {
  async listar(empresaId: string, filialId: string): Promise<UnidadeMedida[]> {
    await delay();
    return mockUnidadesMedida.filter((u) => u.deletadoEm === null && u.empresaId === empresaId && u.filialId === filialId);
  },
  async listarPorGrupo(grupoId: string): Promise<UnidadeMedida[]> {
    await delay();
    return mockUnidadesMedida.filter((u) => u.deletadoEm === null && u.grupoId === grupoId);
  },
  async codigoExiste(codigo: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = codigo.trim().toUpperCase();
    return mockUnidadesMedida.some(
      (u) => u.deletadoEm === null && u.empresaId === empresaId && u.filialId === filialId && u.codigo.toUpperCase() === t && u.id !== excludeId
    );
  },
  async estaEmUso(id: string): Promise<boolean> {
    await delay(100);
    return mockProdutos.some(
      (p) => p.deletadoEm === null && (p.unidadeBaseId === id || p.unidadeCompraId === id || p.unidadeVendaId === id)
    );
  },
  async salvar(
    data: Partial<UnidadeMedida>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<UnidadeMedida> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockUnidadesMedida.find((u) => u.id === data.id && u.deletadoEm === null) : undefined;
    if (existing) {
      existing.codigo = (data.codigo ?? existing.codigo).trim().toUpperCase();
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.tipo = data.tipo ?? existing.tipo;
      existing.fatorBase = data.fatorBase ?? existing.fatorBase;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: UnidadeMedida = {
      id: `um${Date.now()}`,
      grupoId: ctx.grupoId,
      empresaId: ctx.empresaId,
      filialId: ctx.filialId,
      codigo: (data.codigo ?? "").trim().toUpperCase(),
      descricao: (data.descricao ?? "").trim(),
      tipo: data.tipo ?? "UNIDADE",
      fatorBase: data.fatorBase ?? 1,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockUnidadesMedida.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const u = mockUnidadesMedida.find((u) => u.id === id && u.deletadoEm === null);
    if (u) { u.deletadoEm = now; u.deletadoPor = "u1"; u.atualizadoEm = now; u.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Pontos de Estoque
// ============================================================
export const pontoEstoqueService = {
  async listar(empresaId: string, filialId: string): Promise<PontoEstoque[]> {
    await delay();
    return mockPontosEstoque.filter(
      (p) => p.deletadoEm === null && p.empresaId === empresaId && p.filialId === filialId
    );
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockPontosEstoque.some(
      (p) => p.deletadoEm === null && p.empresaId === empresaId && p.filialId === filialId &&
        p.descricao.toLowerCase() === t && p.id !== excludeId
    );
  },
  async salvar(
    data: Partial<PontoEstoque>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<PontoEstoque> {
    await delay(400);
    const now = new Date().toISOString();
    const userId = "u1";

    // Se marcando como principal, desmarcar outros
    if (data.principal) {
      mockPontosEstoque
        .filter((p) => p.deletadoEm === null && p.empresaId === ctx.empresaId && p.filialId === ctx.filialId && p.id !== data.id)
        .forEach((p) => { p.principal = false; p.atualizadoEm = now; p.atualizadoPor = userId; });
    }

    const existing = data.id ? mockPontosEstoque.find((p) => p.id === data.id && p.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.principal = data.principal ?? existing.principal;
      existing.tipo = data.tipo ?? existing.tipo;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = userId;
      return existing;
    }
    const novo: PontoEstoque = {
      id: `pe_est${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      descricao: (data.descricao ?? "").trim(),
      principal: data.principal ?? false,
      tipo: data.tipo ?? "PROPRIO",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: userId, atualizadoEm: now, atualizadoPor: userId,
      deletadoEm: null, deletadoPor: null,
    };
    mockPontosEstoque.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockPontosEstoque.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = "u1"; p.atualizadoEm = now; p.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Estoque
// ============================================================
export const estoqueService = {
  async listarPorEmpresaFilial(empresaId: string, filialId: string): Promise<Estoque[]> {
    await delay();
    return mockEstoques.filter(
      (e) => e.deletadoEm === null && e.empresaId === empresaId && e.filialId === filialId
    );
  },
  obterSaldo(produtoId: string, pontoEstoqueId: string): Estoque | undefined {
    return mockEstoques.find(
      (e) => e.deletadoEm === null && e.produtoId === produtoId && e.pontoEstoqueId === pontoEstoqueId
    );
  },
  atualizarSaldo(produtoId: string, pontoEstoqueId: string, novaQuantidade: number, ctx: { grupoId: string; empresaId: string; filialId: string }): Estoque {
    const now = new Date().toISOString();
    let registro = mockEstoques.find(
      (e) => e.deletadoEm === null && e.produtoId === produtoId && e.pontoEstoqueId === pontoEstoqueId
    );
    if (registro) {
      registro.quantidadeAtual = novaQuantidade;
      registro.atualizadoEm = now;
      registro.atualizadoPor = "u1";
      return registro;
    }
    registro = {
      id: `est${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId, pontoEstoqueId,
      quantidadeAtual: novaQuantidade,
      custoMedioAtual: null, valorTotalEstoque: null,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockEstoques.push(registro);
    return registro;
  },
};

// ============================================================
// Movimentação de Estoque
// ============================================================
export const movimentacaoEstoqueService = {
  async listar(empresaId: string, filialId: string): Promise<MovimentacaoEstoque[]> {
    await delay();
    return mockMovimentacoesEstoque
      .filter((m) => m.deletadoEm === null && m.empresaId === empresaId && m.filialId === filialId)
      .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
  },
  async registrar(
    data: {
      produtoId: string;
      pontoEstoqueId: string;
      tipoMovimento: TipoMovimentoEstoque;
      quantidadeInformada: number;
      unidadeMovimentacaoId: string;
      dataMovimentacao: string;
      observacao: string;
    },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay(400);
    const now = new Date().toISOString();

    // 1. Buscar produto
    const produto = mockProdutos.find((p) => p.id === data.produtoId && p.deletadoEm === null);
    if (!produto) return { sucesso: false, mensagem: "Produto não encontrado." };

    // 2. Buscar unidade base do produto e unidade da movimentação
    const unidadeBase = mockUnidadesMedida.find((u) => u.id === produto.unidadeBaseId && u.deletadoEm === null);
    const unidadeMov = mockUnidadesMedida.find((u) => u.id === data.unidadeMovimentacaoId && u.deletadoEm === null);
    if (!unidadeBase || !unidadeMov) return { sucesso: false, mensagem: "Unidade de medida inválida." };

    // 3. Validar tipo da unidade
    if (unidadeMov.tipo !== unidadeBase.tipo) {
      return { sucesso: false, mensagem: `Tipo da unidade informada (${unidadeMov.tipo}) difere do tipo da unidade base do produto (${unidadeBase.tipo}). Operação bloqueada.` };
    }

    // 4. Converter para unidade base
    let quantidadeConvertidaBase: number;
    if (data.unidadeMovimentacaoId === produto.unidadeBaseId) {
      quantidadeConvertidaBase = data.quantidadeInformada;
    } else if (data.unidadeMovimentacaoId === produto.unidadeCompraId) {
      quantidadeConvertidaBase = data.quantidadeInformada * produto.quantidadeEmbalagemCompra;
    } else if (data.unidadeMovimentacaoId === produto.unidadeVendaId) {
      quantidadeConvertidaBase = data.quantidadeInformada * produto.quantidadeEmbalagemVenda;
    } else {
      // Conversão genérica por fator
      quantidadeConvertidaBase = (data.quantidadeInformada * unidadeMov.fatorBase) / unidadeBase.fatorBase;
    }

    // 5. Calcular novo saldo
    const saldoAtual = estoqueService.obterSaldo(data.produtoId, data.pontoEstoqueId);
    const qtdAtual = saldoAtual?.quantidadeAtual ?? 0;
    let novaQuantidade: number;

    if (data.tipoMovimento === "ENTRADA") {
      novaQuantidade = qtdAtual + quantidadeConvertidaBase;
    } else if (data.tipoMovimento === "SAIDA") {
      novaQuantidade = qtdAtual - quantidadeConvertidaBase;
    } else {
      // AJUSTE
      novaQuantidade = quantidadeConvertidaBase;
    }

    // 6. Validar estoque negativo
    if (novaQuantidade < 0) {
      const param = mockParametrosComerciais.find(
        (p) => p.deletadoEm === null && p.empresaId === ctx.empresaId
      );
      const permitir = param?.permitirEstoqueNegativo ?? false;
      if (!permitir) {
        return { sucesso: false, mensagem: "Operação não permitida. Estoque insuficiente." };
      }
    }

    // 7. Atualizar saldo
    estoqueService.atualizarSaldo(data.produtoId, data.pontoEstoqueId, novaQuantidade, ctx);

    // 8. Inserir movimentação
    const mov: MovimentacaoEstoque = {
      id: `mov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: data.produtoId, pontoEstoqueId: data.pontoEstoqueId,
      tipoMovimento: data.tipoMovimento,
      quantidadeInformada: data.quantidadeInformada,
      unidadeMovimentacaoId: data.unidadeMovimentacaoId,
      quantidadeConvertidaBase,
      dataMovimentacao: data.dataMovimentacao,
      observacao: data.observacao,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockMovimentacoesEstoque.push(mov);

    return { sucesso: true, mensagem: "Movimentação registrada com sucesso." };
  },
};

// ============================================================
// Moedas
// ============================================================
export const moedaService = {
  async listar(): Promise<Moeda[]> {
    await delay();
    return mockMoedas.filter((m) => m.deletadoEm === null);
  },
  async salvar(data: Partial<Moeda>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Moeda> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockMoedas.find((m) => m.id === data.id && m.deletadoEm === null) : undefined;
    if (existing) {
      existing.codigo = (data.codigo ?? existing.codigo).trim();
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.simbolo = data.simbolo ?? existing.simbolo;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: Moeda = {
      id: `moeda${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      codigo: (data.codigo ?? "").trim(), descricao: (data.descricao ?? "").trim(),
      simbolo: data.simbolo ?? "", ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockMoedas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const m = mockMoedas.find((m) => m.id === id && m.deletadoEm === null);
    if (m) { m.deletadoEm = now; m.deletadoPor = "u1"; m.atualizadoEm = now; m.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Cotação de Moedas
// ============================================================
export const cotacaoMoedaService = {
  async listar(): Promise<CotacaoMoeda[]> {
    await delay();
    return mockCotacoesMoeda.filter((c) => c.deletadoEm === null);
  },
  obterUltima(moedaOrigemId: string, moedaDestinoId: string): CotacaoMoeda | undefined {
    return mockCotacoesMoeda
      .filter((c) => c.deletadoEm === null && c.moedaOrigemId === moedaOrigemId && c.moedaDestinoId === moedaDestinoId)
      .sort((a, b) => new Date(b.dataHoraCotacao).getTime() - new Date(a.dataHoraCotacao).getTime())[0];
  },
  simularAtualizacao(): { usd: CotacaoMoeda; eur: CotacaoMoeda } {
    const now = new Date().toISOString();
    const lastUsd = this.obterUltima("moeda2", "moeda1");
    const lastEur = this.obterUltima("moeda3", "moeda1");

    const randomVariation = (base: number) => {
      const pct = (Math.random() - 0.5) * 0.04; // ±2%
      return Math.round((base * (1 + pct)) * 1000000) / 1000000;
    };

    const baseUsd = lastUsd?.valorCompra ?? 5.02;
    const baseEur = lastEur?.valorCompra ?? 5.43;
    const newUsdCompra = randomVariation(baseUsd);
    const newEurCompra = randomVariation(baseEur);
    const usdVar = newUsdCompra - baseUsd;
    const eurVar = newEurCompra - baseEur;

    const usd: CotacaoMoeda = {
      id: `cot${Date.now()}a`, grupoId: "g1", empresaId: "e1", filialId: "f1",
      moedaOrigemId: "moeda2", moedaDestinoId: "moeda1",
      valorCompra: newUsdCompra, valorVenda: Math.round((newUsdCompra + 0.02) * 1000000) / 1000000,
      variacao: Math.round(usdVar * 1000000) / 1000000,
      variacaoPercentual: Math.round((usdVar / baseUsd) * 10000) / 100,
      valorMaximo: Math.max(newUsdCompra, lastUsd?.valorMaximo ?? 0),
      valorMinimo: Math.min(newUsdCompra, lastUsd?.valorMinimo ?? Infinity),
      dataHoraCotacao: now, fonte: "Mock",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };

    const eur: CotacaoMoeda = {
      id: `cot${Date.now()}b`, grupoId: "g1", empresaId: "e1", filialId: "f1",
      moedaOrigemId: "moeda3", moedaDestinoId: "moeda1",
      valorCompra: newEurCompra, valorVenda: Math.round((newEurCompra + 0.03) * 1000000) / 1000000,
      variacao: Math.round(eurVar * 1000000) / 1000000,
      variacaoPercentual: Math.round((eurVar / baseEur) * 10000) / 100,
      valorMaximo: Math.max(newEurCompra, lastEur?.valorMaximo ?? 0),
      valorMinimo: Math.min(newEurCompra, lastEur?.valorMinimo ?? Infinity),
      dataHoraCotacao: now, fonte: "Mock",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };

    mockCotacoesMoeda.push(usd, eur);
    return { usd, eur };
  },
};

// ============================================================
// Ponto Estoque ↔ Tipo Produto
// ============================================================
export const pontoEstoqueTipoProdutoService = {
  async listarPorPonto(pontoEstoqueId: string): Promise<PontoEstoqueTipoProduto[]> {
    await delay();
    return mockPontoEstoqueTiposProduto.filter(
      (p) => p.deletadoEm === null && p.pontoEstoqueId === pontoEstoqueId
    );
  },
  async salvar(
    data: { pontoEstoqueId: string; tipoProdutoId: string },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<PontoEstoqueTipoProduto> {
    await delay(200);
    const now = new Date().toISOString();
    // Check dup
    const dup = mockPontoEstoqueTiposProduto.find(
      (p) => p.deletadoEm === null && p.pontoEstoqueId === data.pontoEstoqueId && p.tipoProdutoId === data.tipoProdutoId
    );
    if (dup) return dup;
    const novo: PontoEstoqueTipoProduto = {
      id: `petp${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      pontoEstoqueId: data.pontoEstoqueId, tipoProdutoId: data.tipoProdutoId,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockPontoEstoqueTiposProduto.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockPontoEstoqueTiposProduto.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = "u1"; p.atualizadoEm = now; p.atualizadoPor = "u1"; }
  },
  async sincronizar(
    pontoEstoqueId: string,
    tipoProdutoIds: string[],
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<void> {
    const now = new Date().toISOString();
    // Remove existing
    mockPontoEstoqueTiposProduto
      .filter((p) => p.deletadoEm === null && p.pontoEstoqueId === pontoEstoqueId)
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = "u1"; });
    // Add new
    for (const tpId of tipoProdutoIds) {
      const novo: PontoEstoqueTipoProduto = {
        id: `petp${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        pontoEstoqueId, tipoProdutoId: tpId,
        criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      mockPontoEstoqueTiposProduto.push(novo);
    }
  },
};

// ============================================================
// Contratos
// ============================================================
export const contratoService = {
  async listar(empresaId: string, filialId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter(
      (c) => c.deletadoEm === null && c.empresaId === empresaId && c.filialId === filialId
    );
  },
  async listarTodos(grupoId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter((c) => c.deletadoEm === null && c.grupoId === grupoId);
  },
  async salvar(
    data: Partial<Contrato>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<Contrato> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockContratos.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: "u1", deletadoEm: null, deletadoPor: null,
      });
      return existing;
    }
    // Convert quantity to base
    const produto = mockProdutos.find((p) => p.id === data.produtoId);
    const unidadeNeg = mockUnidadesMedida.find((u) => u.id === data.unidadeNegociacaoId);
    const unidadeBase = produto ? mockUnidadesMedida.find((u) => u.id === produto.unidadeBaseId) : undefined;
    let quantidadeBaseTotal = data.quantidadeTotal ?? 0;
    if (unidadeNeg && unidadeBase && unidadeBase.fatorBase > 0) {
      quantidadeBaseTotal = ((data.quantidadeTotal ?? 0) * unidadeNeg.fatorBase) / unidadeBase.fatorBase;
    }

    const novo: Contrato = {
      id: `ctr${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      numeroContrato: data.numeroContrato ?? "",
      tipoContrato: data.tipoContrato ?? "COMPRA",
      pessoaId: data.pessoaId ?? "",
      produtoId: data.produtoId ?? "",
      unidadeNegociacaoId: data.unidadeNegociacaoId ?? "",
      quantidadeTotal: data.quantidadeTotal ?? 0,
      quantidadeEntregue: 0,
      quantidadeSaldo: data.quantidadeTotal ?? 0,
      quantidadeBaseTotal,
      moedaId: data.moedaId ?? "moeda1",
      precoUnitario: data.precoUnitario ?? 0,
      tipoPreco: data.tipoPreco ?? "FIXO",
      dataContrato: data.dataContrato ?? new Date().toISOString().slice(0, 10),
      dataEntregaInicio: data.dataEntregaInicio ?? "",
      dataEntregaFim: data.dataEntregaFim ?? "",
      status: "ABERTO",
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const now = new Date().toISOString();
    // Check if has entregas
    const hasEntregas = mockContratoEntregas.some((e) => e.contratoId === id && e.deletadoEm === null);
    if (hasEntregas) return { sucesso: false, mensagem: "Não é possível excluir contrato com entregas vinculadas." };
    const c = mockContratos.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = "u1"; c.atualizadoEm = now; c.atualizadoPor = "u1"; }
    return { sucesso: true, mensagem: "Contrato excluído com sucesso." };
  },
  async numeroExiste(numero: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = numero.trim().toUpperCase();
    return mockContratos.some((c) => c.deletadoEm === null && c.numeroContrato.toUpperCase() === t && c.id !== excludeId);
  },
};

// ============================================================
// Contrato Entregas (Romaneios)
// ============================================================
export const contratoEntregaService = {
  async listarPorContrato(contratoId: string): Promise<ContratoEntrega[]> {
    await delay();
    return mockContratoEntregas
      .filter((e) => e.deletadoEm === null && e.contratoId === contratoId)
      .sort((a, b) => new Date(b.dataEntrega).getTime() - new Date(a.dataEntrega).getTime());
  },
  async salvar(
    data: Partial<ContratoEntrega>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; entrega?: ContratoEntrega }> {
    await delay(400);
    const now = new Date().toISOString();

    const contrato = mockContratos.find((c) => c.id === data.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    // Convert to base
    const produto = mockProdutos.find((p) => p.id === contrato.produtoId);
    const unidadeInf = mockUnidadesMedida.find((u) => u.id === data.unidadeInformadaId);
    const unidadeBase = produto ? mockUnidadesMedida.find((u) => u.id === produto.unidadeBaseId) : undefined;
    let quantidadeConvertidaBase = data.quantidadeInformada ?? 0;
    if (unidadeInf && unidadeBase && unidadeBase.fatorBase > 0) {
      quantidadeConvertidaBase = ((data.quantidadeInformada ?? 0) * unidadeInf.fatorBase) / unidadeBase.fatorBase;
    }

    const existing = data.id ? mockContratoEntregas.find((e) => e.id === data.id && e.deletadoEm === null) : undefined;

    if (existing) {
      // Revert old quantities from contract
      contrato.quantidadeEntregue -= existing.quantidadeInformada;
      contrato.quantidadeSaldo += existing.quantidadeInformada;

      Object.assign(existing, data, {
        quantidadeConvertidaBase,
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: "u1",
      });

      // Apply new quantities
      contrato.quantidadeEntregue += (data.quantidadeInformada ?? 0);
      contrato.quantidadeSaldo -= (data.quantidadeInformada ?? 0);
      contrato.status = contrato.quantidadeSaldo <= 0 ? "FINALIZADO" : contrato.quantidadeEntregue > 0 ? "PARCIAL" : "ABERTO";
      contrato.atualizadoEm = now;
      contrato.atualizadoPor = "u1";

      return { sucesso: true, mensagem: "Romaneio atualizado.", entrega: existing };
    }

    // Validate saldo
    if ((data.quantidadeInformada ?? 0) > contrato.quantidadeSaldo) {
      return { sucesso: false, mensagem: `Quantidade (${data.quantidadeInformada}) excede o saldo do contrato (${contrato.quantidadeSaldo}).` };
    }

    const entrega: ContratoEntrega = {
      id: `ctre${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId: data.contratoId!,
      dataEntrega: data.dataEntrega ?? now,
      quantidadeInformada: data.quantidadeInformada ?? 0,
      unidadeInformadaId: data.unidadeInformadaId ?? "",
      quantidadeConvertidaBase,
      pontoEstoqueId: data.pontoEstoqueId ?? "",
      pesoBruto: data.pesoBruto ?? null,
      pesoLiquido: data.pesoLiquido ?? null,
      pesoClassificado: data.pesoClassificado ?? null,
      descontoTotalPercentual: data.descontoTotalPercentual ?? null,
      pesoComercial: data.pesoComercial ?? null,
      placaVeiculo: data.placaVeiculo ?? "",
      nomeMotorista: data.nomeMotorista ?? "",
      documentoMotorista: data.documentoMotorista ?? "",
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoEntregas.push(entrega);

    // Update contract saldo
    contrato.quantidadeEntregue += entrega.quantidadeInformada;
    contrato.quantidadeSaldo -= entrega.quantidadeInformada;
    contrato.status = contrato.quantidadeSaldo <= 0 ? "FINALIZADO" : "PARCIAL";
    contrato.atualizadoEm = now;
    contrato.atualizadoPor = "u1";

    // Create stock movement
    const tipoMov = contrato.tipoContrato === "COMPRA" ? "ENTRADA" : "SAIDA";
    const mov: MovimentacaoEstoque = {
      id: `mov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: contrato.produtoId, pontoEstoqueId: entrega.pontoEstoqueId,
      tipoMovimento: tipoMov,
      quantidadeInformada: entrega.quantidadeInformada,
      unidadeMovimentacaoId: entrega.unidadeInformadaId,
      quantidadeConvertidaBase: entrega.quantidadeConvertidaBase,
      dataMovimentacao: entrega.dataEntrega,
      observacao: `Romaneio ${entrega.id} — Contrato ${contrato.numeroContrato}`,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockMovimentacoesEstoque.push(mov);

    // Update estoque
    const saldoAtual = estoqueService.obterSaldo(contrato.produtoId, entrega.pontoEstoqueId);
    const qtdAtual = saldoAtual?.quantidadeAtual ?? 0;
    const novaQtd = tipoMov === "ENTRADA"
      ? qtdAtual + entrega.quantidadeConvertidaBase
      : qtdAtual - entrega.quantidadeConvertidaBase;
    estoqueService.atualizarSaldo(contrato.produtoId, entrega.pontoEstoqueId, novaQtd, ctx);

    return { sucesso: true, mensagem: "Romaneio registrado e estoque atualizado.", entrega };
  },
  async excluir(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const now = new Date().toISOString();
    const e = mockContratoEntregas.find((e) => e.id === id && e.deletadoEm === null);
    if (!e) return { sucesso: false, mensagem: "Entrega não encontrada." };

    // Revert contract
    const contrato = mockContratos.find((c) => c.id === e.contratoId && c.deletadoEm === null);
    if (contrato) {
      contrato.quantidadeEntregue -= e.quantidadeInformada;
      contrato.quantidadeSaldo += e.quantidadeInformada;
      contrato.status = contrato.quantidadeEntregue <= 0 ? "ABERTO" : "PARCIAL";
      contrato.atualizadoEm = now;
      contrato.atualizadoPor = "u1";
    }

    e.deletadoEm = now; e.deletadoPor = "u1"; e.atualizadoEm = now; e.atualizadoPor = "u1";
    return { sucesso: true, mensagem: "Romaneio excluído." };
  },
};

// ============================================================
// Contrato Fixações
// ============================================================
export const contratoFixacaoService = {
  async listarPorContrato(contratoId: string): Promise<ContratoFixacao[]> {
    await delay();
    return mockContratoFixacoes
      .filter((f) => f.deletadoEm === null && f.contratoId === contratoId)
      .sort((a, b) => new Date(b.dataFixacao).getTime() - new Date(a.dataFixacao).getTime());
  },
  async salvar(
    data: Partial<ContratoFixacao>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; fixacao?: ContratoFixacao }> {
    await delay(400);
    const now = new Date().toISOString();

    const contrato = mockContratos.find((c) => c.id === data.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    // Calculate total already fixed
    const jaFixado = mockContratoFixacoes
      .filter((f) => f.deletadoEm === null && f.contratoId === data.contratoId && f.id !== data.id)
      .reduce((sum, f) => sum + f.quantidadeFixada, 0);

    if (jaFixado + (data.quantidadeFixada ?? 0) > contrato.quantidadeTotal) {
      return { sucesso: false, mensagem: "Quantidade fixada excede o saldo do contrato." };
    }

    const existing = data.id ? mockContratoFixacoes.find((f) => f.id === data.id && f.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: "u1",
      });
      return { sucesso: true, mensagem: "Fixação atualizada.", fixacao: existing };
    }

    const fixacao: ContratoFixacao = {
      id: `ctrf${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId: data.contratoId!,
      dataFixacao: data.dataFixacao ?? now,
      quantidadeFixada: data.quantidadeFixada ?? 0,
      unidadeFixacaoId: data.unidadeFixacaoId ?? "",
      precoFixado: data.precoFixado ?? 0,
      moedaId: data.moedaId ?? "moeda1",
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoFixacoes.push(fixacao);
    return { sucesso: true, mensagem: "Fixação registrada.", fixacao };
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const f = mockContratoFixacoes.find((f) => f.id === id && f.deletadoEm === null);
    if (f) { f.deletadoEm = now; f.deletadoPor = "u1"; f.atualizadoEm = now; f.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Condições de Desconto — Modelos
// ============================================================
export const condicaoDescontoModeloService = {
  async listar(empresaId: string, filialId: string): Promise<CondicaoDescontoModelo[]> {
    await delay();
    return mockCondicaoDescontoModelos.filter(
      (m) => m.deletadoEm === null && m.empresaId === empresaId && m.filialId === filialId
    );
  },
  async listarTodos(): Promise<CondicaoDescontoModelo[]> {
    await delay();
    return mockCondicaoDescontoModelos.filter((m) => m.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockCondicaoDescontoModelos.some(
      (m) => m.deletadoEm === null && m.empresaId === empresaId && m.filialId === filialId &&
        m.descricao.toLowerCase() === t && m.id !== excludeId
    );
  },
  async salvar(
    data: Partial<CondicaoDescontoModelo>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<CondicaoDescontoModelo> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockCondicaoDescontoModelos.find((m) => m.id === data.id && m.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: CondicaoDescontoModelo = {
      id: `cdm${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      descricao: (data.descricao ?? "").trim(),
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockCondicaoDescontoModelos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const m = mockCondicaoDescontoModelos.find((m) => m.id === id && m.deletadoEm === null);
    if (m) { m.deletadoEm = now; m.deletadoPor = "u1"; m.atualizadoEm = now; m.atualizadoPor = "u1"; }
  },
  async possuiItens(id: string): Promise<boolean> {
    await delay(100);
    return mockCondicaoDescontoModeloItens.some((i) => i.modeloId === id && i.deletadoEm === null);
  },
};

// ============================================================
// Condições de Desconto — Modelo Itens
// ============================================================
export const condicaoDescontoModeloItemService = {
  async listarPorModelo(modeloId: string): Promise<CondicaoDescontoModeloItem[]> {
    await delay();
    return mockCondicaoDescontoModeloItens
      .filter((i) => i.deletadoEm === null && i.modeloId === modeloId)
      .sort((a, b) => a.ordemCalculo - b.ordemCalculo);
  },
  async salvar(
    data: Partial<CondicaoDescontoModeloItem>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<CondicaoDescontoModeloItem> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockCondicaoDescontoModeloItens.find((i) => i.id === data.id && i.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.tipo = data.tipo ?? existing.tipo;
      existing.valor = data.valor ?? existing.valor;
      existing.ordemCalculo = data.ordemCalculo ?? existing.ordemCalculo;
      existing.automatico = data.automatico ?? existing.automatico;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: CondicaoDescontoModeloItem = {
      id: `cdmi${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      modeloId: data.modeloId ?? "",
      descricao: (data.descricao ?? "").trim(),
      tipo: data.tipo ?? "PERCENTUAL",
      valor: data.valor ?? 0,
      ordemCalculo: data.ordemCalculo ?? 1,
      automatico: data.automatico ?? false,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockCondicaoDescontoModeloItens.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const i = mockCondicaoDescontoModeloItens.find((i) => i.id === id && i.deletadoEm === null);
    if (i) { i.deletadoEm = now; i.deletadoPor = "u1"; i.atualizadoEm = now; i.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Contrato Condições (vinculadas ao contrato)
// ============================================================
export const contratoCondicaoService = {
  async listarPorContrato(contratoId: string): Promise<ContratoCondicao[]> {
    await delay();
    return mockContratoCondicoes
      .filter((c) => c.deletadoEm === null && c.contratoId === contratoId)
      .sort((a, b) => a.ordemCalculo - b.ordemCalculo);
  },
  async aplicarModelo(
    contratoId: string,
    modeloId: string,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<ContratoCondicao[]> {
    await delay(400);
    const now = new Date().toISOString();
    // Remove existing conditions for this contract
    mockContratoCondicoes
      .filter((c) => c.contratoId === contratoId && c.deletadoEm === null)
      .forEach((c) => { c.deletadoEm = now; c.deletadoPor = "u1"; });

    // Copy items from modelo
    const itens = mockCondicaoDescontoModeloItens
      .filter((i) => i.modeloId === modeloId && i.deletadoEm === null)
      .sort((a, b) => a.ordemCalculo - b.ordemCalculo);

    const novas: ContratoCondicao[] = itens.map((item, idx) => ({
      id: `ctrcond${Date.now()}${idx}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId,
      modeloItemId: item.id,
      descricao: item.descricao,
      tipo: item.tipo,
      valor: item.valor,
      automatico: item.automatico,
      ordemCalculo: item.ordemCalculo,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    }));
    mockContratoCondicoes.push(...novas);
    return novas;
  },
  async salvar(
    data: Partial<ContratoCondicao>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<ContratoCondicao> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockContratoCondicoes.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      if (!existing.automatico) {
        existing.descricao = (data.descricao ?? existing.descricao).trim();
        existing.tipo = data.tipo ?? existing.tipo;
        existing.valor = data.valor ?? existing.valor;
        existing.ordemCalculo = data.ordemCalculo ?? existing.ordemCalculo;
      }
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: ContratoCondicao = {
      id: `ctrcond${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId: data.contratoId ?? "",
      modeloItemId: data.modeloItemId ?? null,
      descricao: (data.descricao ?? "").trim(),
      tipo: data.tipo ?? "PERCENTUAL",
      valor: data.valor ?? 0,
      automatico: data.automatico ?? false,
      ordemCalculo: data.ordemCalculo ?? 1,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoCondicoes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockContratoCondicoes.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = "u1"; c.atualizadoEm = now; c.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Classificação de Grãos — Tipos
// ============================================================
export const classificacaoTipoService = {
  async listar(empresaId: string, filialId: string): Promise<ClassificacaoTipo[]> {
    await delay();
    return mockClassificacaoTipos.filter(
      (t) => t.deletadoEm === null && t.empresaId === empresaId && t.filialId === filialId
    );
  },
  async listarTodos(): Promise<ClassificacaoTipo[]> {
    await delay();
    return mockClassificacaoTipos.filter((t) => t.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockClassificacaoTipos.some(
      (ct) => ct.deletadoEm === null && ct.empresaId === empresaId && ct.filialId === filialId &&
        ct.descricao.toLowerCase() === t && ct.id !== excludeId
    );
  },
  async salvar(
    data: Partial<ClassificacaoTipo>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<ClassificacaoTipo> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockClassificacaoTipos.find((t) => t.id === data.id && t.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.unidade = data.unidade ?? existing.unidade;
      existing.valorBase = data.valorBase !== undefined ? data.valorBase : existing.valorBase;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: ClassificacaoTipo = {
      id: `ct${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      descricao: (data.descricao ?? "").trim(),
      unidade: data.unidade ?? "PERCENTUAL",
      valorBase: data.valorBase ?? null,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockClassificacaoTipos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockClassificacaoTipos.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = "u1"; t.atualizadoEm = now; t.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Produto Classificações
// ============================================================
export const produtoClassificacaoService = {
  async listarPorProduto(produtoId: string): Promise<ProdutoClassificacao[]> {
    await delay();
    return mockProdutoClassificacoes.filter((p) => p.deletadoEm === null && p.produtoId === produtoId);
  },
  async salvar(
    data: Partial<ProdutoClassificacao>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<ProdutoClassificacao> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockProdutoClassificacoes.find((p) => p.id === data.id && p.deletadoEm === null) : undefined;
    if (existing) {
      existing.classificacaoTipoId = data.classificacaoTipoId ?? existing.classificacaoTipoId;
      existing.valorPadrao = data.valorPadrao ?? existing.valorPadrao;
      existing.limiteTolerancia = data.limiteTolerancia ?? existing.limiteTolerancia;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: ProdutoClassificacao = {
      id: `pc${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: data.produtoId ?? "",
      classificacaoTipoId: data.classificacaoTipoId ?? "",
      valorPadrao: data.valorPadrao ?? 0,
      limiteTolerancia: data.limiteTolerancia ?? 0,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoClassificacoes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockProdutoClassificacoes.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = "u1"; p.atualizadoEm = now; p.atualizadoPor = "u1"; }
  },
};

// ============================================================
// Classificação Descontos
// ============================================================
export const classificacaoDescontoService = {
  async listarPorProduto(produtoId: string): Promise<ClassificacaoDesconto[]> {
    await delay();
    return mockClassificacaoDescontos.filter((d) => d.deletadoEm === null && d.produtoId === produtoId);
  },
  async salvar(
    data: Partial<ClassificacaoDesconto>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<ClassificacaoDesconto> {
    await delay(200);
    const now = new Date().toISOString();
    const existing = data.id ? mockClassificacaoDescontos.find((d) => d.id === data.id && d.deletadoEm === null) : undefined;
    if (existing) {
      existing.classificacaoTipoId = data.classificacaoTipoId ?? existing.classificacaoTipoId;
      existing.valorMinimo = data.valorMinimo ?? existing.valorMinimo;
      existing.valorMaximo = data.valorMaximo ?? existing.valorMaximo;
      existing.percentualDesconto = data.percentualDesconto ?? existing.percentualDesconto;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: ClassificacaoDesconto = {
      id: `cd${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: data.produtoId ?? "",
      classificacaoTipoId: data.classificacaoTipoId ?? "",
      valorMinimo: data.valorMinimo ?? 0,
      valorMaximo: data.valorMaximo ?? 0,
      percentualDesconto: data.percentualDesconto ?? 0,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockClassificacaoDescontos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const d = mockClassificacaoDescontos.find((d) => d.id === id && d.deletadoEm === null);
    if (d) { d.deletadoEm = now; d.deletadoPor = "u1"; d.atualizadoEm = now; d.atualizadoPor = "u1"; }
  },
  buscarDescontoPorFaixa(produtoId: string, classificacaoTipoId: string, valor: number): number {
    const faixa = mockClassificacaoDescontos.find(
      (d) => d.deletadoEm === null && d.produtoId === produtoId &&
        d.classificacaoTipoId === classificacaoTipoId &&
        valor >= d.valorMinimo && valor <= d.valorMaximo
    );
    return faixa?.percentualDesconto ?? 0;
  },
};

// ============================================================
// Romaneio Classificações
// ============================================================
export const romaneioClassificacaoService = {
  async listarPorRomaneio(romaneioId: string): Promise<RomaneioClassificacao[]> {
    await delay();
    return mockRomaneioClassificacoes.filter((r) => r.deletadoEm === null && r.romaneioId === romaneioId);
  },
  async salvarClassificacoes(
    romaneioId: string,
    itens: { classificacaoTipoId: string; valorApurado: number; percentualDesconto: number }[],
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<RomaneioClassificacao[]> {
    await delay(200);
    const now = new Date().toISOString();
    // Remove old
    mockRomaneioClassificacoes
      .filter((r) => r.romaneioId === romaneioId && r.deletadoEm === null)
      .forEach((r) => { r.deletadoEm = now; r.deletadoPor = "u1"; });
    // Insert new
    const novas: RomaneioClassificacao[] = itens.map((item, idx) => ({
      id: `rc${Date.now()}${idx}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      romaneioId,
      classificacaoTipoId: item.classificacaoTipoId,
      valorApurado: item.valorApurado,
      percentualDesconto: item.percentualDesconto,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    }));
    mockRomaneioClassificacoes.push(...novas);
    return novas;
  },
};
