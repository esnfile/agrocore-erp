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
  estoquesTransito as mockEstoquesTransito,
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
  financeiroContas as mockFinanceiroContas,
  financeiroParcelas as mockFinanceiroParcelas,
  financeiroBaixas as mockFinanceiroBaixas,
  financeiroBancos as mockFinanceiroBancos,
  financeiroTipoContas as mockFinanceiroTipoContas,
  financeiroContasFinanceiras as mockFinanceiroContasFinanceiras,
  financeiroTiposLancamento as mockFinanceiroTiposLancamento,
  financeiroFormasPagto as mockFinanceiroFormasPagto,
  financeiroPlanoContas as mockFinanceiroPlanoContas,
  financeiroCentrosCusto as mockFinanceiroCentrosCusto,
  financeiroMovimentacoes as mockFinanceiroMovimentacoes,
  financeiroAdiantamentos as mockFinanceiroAdiantamentos,
} from "./mock-data";
import type {
  Empresa, Filial, Grupo, GrupoPessoa, Pessoa,
  TipoProduto, MarcaProduto, DivisaoProduto, SecaoProduto, GrupoProduto, SubgrupoProduto,
  Coeficiente, CoeficienteEmpresa, TabelaPreco, TabelaPrecoEmpresa, ParametroComercial, AplicaSobre,
  Produto, ProdutoEmpresa, ProdutoEmpresaTabelaPreco, TipoBaixaEstoque,
  UnidadeMedida, TipoUnidadeMedida,
  PontoEstoque, TipoPontoEstoque, Estoque, MovimentacaoEstoque, TipoMovimentoEstoque,
  EstoqueTransito, StatusEstoqueTransito,
  Moeda, CotacaoMoeda, PontoEstoqueTipoProduto,
  Contrato, ContratoEntrega, ContratoFixacao, TipoContrato, TipoPreco, StatusContrato,
  CondicaoDescontoModelo, CondicaoDescontoModeloItem, ContratoCondicao, TipoCondicaoDesconto,
  ClassificacaoTipo, UnidadeClassificacao, ProdutoClassificacao, ClassificacaoDesconto, RomaneioClassificacao,
  FinanceiroConta, FinanceiroParcela, FinanceiroBaixa, TipoConta, StatusConta, OrigemConta, StatusParcela, FormaPagamento,
  FinanceiroBanco, FinanceiroTipoConta, FinanceiroContaFinanceira, FinanceiroTipoLancamento,
  FinanceiroFormaPagto, TipoFormaPagamento, FinanceiroPlanoConta, TipoPlanoConta,
  FinanceiroCentroCusto, FinanceiroMovimentacao, TipoMovimentoFinanceiro,
  FinanceiroAdiantamento, StatusAdiantamento,
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

// ============================================================
// Generic CRUD service factory for CORPORATE tables (grupo-level, no empresa/filial)
// ============================================================
interface CorporateEntity {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

function createCorporateCrudService<T extends CorporateEntity>(store: T[], prefix: string) {
  return {
    async listar(empresaId: string, filialId: string): Promise<T[]> {
      await delay();
      // Corporate entities: filter by grupoId only (get from first empresa match)
      return store.filter((i) => i.deletadoEm === null);
    },
    async listarPorGrupo(grupoId: string): Promise<T[]> {
      await delay();
      return store.filter((i) => i.deletadoEm === null && i.grupoId === grupoId);
    },
    async listarTodos(): Promise<T[]> {
      await delay();
      return store.filter((i) => i.deletadoEm === null);
    },
    async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
      await delay(100);
      const trimmed = descricao.trim().toLowerCase();
      // For corporate entities, check across the whole group
      return store.some(
        (i) => i.deletadoEm === null &&
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
        empresaId: null,
        filialId: null,
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

export const tipoProdutoService = createCorporateCrudService<TipoProduto>(mockTiposProduto, "tp");
export const marcaProdutoService = createCorporateCrudService<MarcaProduto>(mockMarcasProduto, "mp");
export const divisaoProdutoService = createCorporateCrudService<DivisaoProduto>(mockDivisoesProduto, "dp");
export const secaoProdutoService = createCorporateCrudService<SecaoProduto>(mockSecoesProduto, "sp");
export const grupoProdutoService = createCorporateCrudService<GrupoProduto>(mockGruposProduto, "grp");
export const subgrupoProdutoService = createCorporateCrudService<SubgrupoProduto>(mockSubgruposProduto, "sgp");

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
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      codigoBarras: data.codigoBarras ?? "",
      tipoProdutoId: data.tipoProdutoId ?? "",
      descricao: (data.descricao ?? "").trim(),
      aplicacao: data.aplicacao ?? "",
      tipoBaixaEstoque: data.tipoBaixaEstoque ?? "INDIVIDUAL",
      quantidadeEmbalagemEntrada: data.quantidadeEmbalagemEntrada ?? 1,
      quantidadeEmbalagemSaida: data.quantidadeEmbalagemSaida ?? 1,
      divisaoProdutoId: data.divisaoProdutoId ?? "",
      secaoProdutoId: data.secaoProdutoId ?? "",
      grupoProdutoId: data.grupoProdutoId ?? "",
      subgrupoProdutoId: data.subgrupoProdutoId ?? "",
      marcaProdutoId: data.marcaProdutoId ?? null,
      unidadeBaseId: data.unidadeBaseId ?? "",
      unidadeEntradaId: data.unidadeEntradaId ?? "",
      unidadeSaidaId: data.unidadeSaidaId ?? "",
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
  /**
   * Retorna preço sugerido para um produto com base no tipo de contrato e empresa.
   * COMPRA: custoCalculado (custo base + coeficientes %).
   * VENDA: precoCalculado (custoCalculado + margem da tabela de preço).
   */
  async getPrecoProduto(
    produtoId: string,
    tipoContrato: "COMPRA" | "VENDA",
    empresaId: string
  ): Promise<{
    valor: number;
    origem: string;
    breakdown: { tipo: string; percentual: number; valor: number }[];
  } | null> {
    await delay(150);
    // Find produtoEmpresa
    const pe = mockProdutoEmpresas.find(
      (p) => p.deletadoEm === null && p.produtoId === produtoId && p.empresaId === empresaId && p.ativo
    );
    if (!pe) return null;

    // Find coeficienteEmpresa
    const ce = mockCoeficienteEmpresas.find(
      (c) => c.deletadoEm === null && c.id === pe.coeficienteEmpresaId
    );
    // Find coeficiente (for name)
    const coef = ce ? mockCoeficientes.find((c) => c.id === ce.coeficienteId && c.deletadoEm === null) : undefined;
    const coefNome = coef?.descricao ?? "Padrão";

    const custoBase = pe.custoBase;
    const percFixo = ce?.percentualCustoFixo ?? 0;
    const percVariavel = ce?.percentualCustoVariavel ?? 0;
    const percImpostos = ce?.percentualImpostos ?? 0;

    const valFixo = custoBase * (percFixo / 100);
    const valVariavel = custoBase * (percVariavel / 100);
    const valImpostos = custoBase * (percImpostos / 100);
    const custoCalculado = custoBase + valFixo + valVariavel + valImpostos;

    const breakdown: { tipo: string; percentual: number; valor: number }[] = [
      { tipo: "Custo Base", percentual: 0, valor: custoBase },
      { tipo: "Custo Fixo", percentual: percFixo, valor: valFixo },
      { tipo: "Custo Variável", percentual: percVariavel, valor: valVariavel },
      { tipo: "Impostos", percentual: percImpostos, valor: valImpostos },
    ];

    if (tipoContrato === "COMPRA") {
      return {
        valor: Math.round(custoCalculado * 100) / 100,
        origem: `Coeficiente ${coefNome}`,
        breakdown,
      };
    }

    // VENDA: apply markup from tabela de preço
    const petp = mockProdutoEmpresaTabelasPreco.find(
      (t) => t.deletadoEm === null && t.produtoEmpresaId === pe.id && t.ativo
    );
    const tpe = petp ? mockTabelaPrecoEmpresas.find((t) => t.id === petp.tabelaPrecoEmpresaId && t.deletadoEm === null) : undefined;
    const tabela = tpe ? mockTabelasPreco.find((t) => t.id === tpe.tabelaPrecoId && t.deletadoEm === null) : undefined;
    const tabelaNome = tabela?.descricao ?? "Padrão";
    const markup = tpe?.margemLucroPercentual ?? 0;
    const valMarkup = custoCalculado * (markup / 100);
    const precoVenda = custoCalculado + valMarkup;

    breakdown.push({ tipo: `Markup (${tabelaNome})`, percentual: markup, valor: valMarkup });

    return {
      valor: Math.round(precoVenda * 100) / 100,
      origem: `Tabela ${tabelaNome}`,
      breakdown,
    };
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
    // Corporate entity - list all for the group
    return mockUnidadesMedida.filter((u) => u.deletadoEm === null);
  },
  async listarPorGrupo(grupoId: string): Promise<UnidadeMedida[]> {
    await delay();
    return mockUnidadesMedida.filter((u) => u.deletadoEm === null && u.grupoId === grupoId);
  },
  obterPorId(id: string): UnidadeMedida | undefined {
    return mockUnidadesMedida.find((u) => u.id === id && u.deletadoEm === null);
  },
  /**
   * Converte uma quantidade entre duas unidades do mesmo tipo.
   * Com produtoId, usa quantidadeEmbalagem específica do produto (prioridade).
   * Sem produtoId, usa fatorBase global da unidade.
   * Lógica: origem → unidadeBase (do produto) → destino
   */
  converterQuantidade(valor: number, unidadeOrigemId: string, unidadeDestinoId: string, produtoId?: string): number {
    if (unidadeOrigemId === unidadeDestinoId) return valor;
    const unidadeOrigem = mockUnidadesMedida.find((u) => u.id === unidadeOrigemId && u.deletadoEm === null);
    const unidadeDestino = mockUnidadesMedida.find((u) => u.id === unidadeDestinoId && u.deletadoEm === null);
    if (!unidadeOrigem || !unidadeDestino) {
      throw new Error("Unidade de origem ou destino não encontrada.");
    }
    if (unidadeOrigem.tipo !== unidadeDestino.tipo) {
      throw new Error(`Não é possível converter ${unidadeOrigem.tipo} para ${unidadeDestino.tipo}.`);
    }
    if (unidadeDestino.fatorBase === 0) {
      throw new Error("Fator base da unidade destino não pode ser zero.");
    }

    // Se temos produto, usar conversão hierárquica: origem → base → destino
    const produto = produtoId ? mockProdutos.find((p) => p.id === produtoId && p.deletadoEm === null) : null;
    if (produto) {
      const unidadeBase = mockUnidadesMedida.find((u) => u.id === produto.unidadeBaseId && u.deletadoEm === null);
      if (!unidadeBase) {
        // fallback genérico
        return (valor * unidadeOrigem.fatorBase) / unidadeDestino.fatorBase;
      }

      // Passo 1: Converter origem → unidadeBase do produto
      let valorBase: number;
      if (unidadeOrigemId === produto.unidadeBaseId) {
        valorBase = valor;
      } else if (unidadeOrigemId === produto.unidadeEntradaId && produto.quantidadeEmbalagemEntrada > 0) {
        valorBase = valor * produto.quantidadeEmbalagemEntrada;
      } else if (unidadeOrigemId === produto.unidadeSaidaId && produto.quantidadeEmbalagemSaida > 0) {
        valorBase = valor * produto.quantidadeEmbalagemSaida;
      } else {
        // Fallback: usar fatorBase global
        valorBase = (valor * unidadeOrigem.fatorBase) / unidadeBase.fatorBase;
      }

      // Passo 2: Converter unidadeBase → destino
      if (unidadeDestinoId === produto.unidadeBaseId) {
        return valorBase;
      } else if (unidadeDestinoId === produto.unidadeEntradaId && produto.quantidadeEmbalagemEntrada > 0) {
        return valorBase / produto.quantidadeEmbalagemEntrada;
      } else if (unidadeDestinoId === produto.unidadeSaidaId && produto.quantidadeEmbalagemSaida > 0) {
        return valorBase / produto.quantidadeEmbalagemSaida;
      } else {
        // Fallback: usar fatorBase global
        return (valorBase * unidadeBase.fatorBase) / unidadeDestino.fatorBase;
      }
    }

    // Sem produto: conversão genérica por fatorBase
    return (valor * unidadeOrigem.fatorBase) / unidadeDestino.fatorBase;
  },
  async codigoExiste(codigo: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = codigo.trim().toUpperCase();
    // Corporate entity - check across group
    return mockUnidadesMedida.some(
      (u) => u.deletadoEm === null && u.codigo.toUpperCase() === t && u.id !== excludeId
    );
  },
  async estaEmUso(id: string): Promise<boolean> {
    await delay(100);
    return mockProdutos.some(
      (p) => p.deletadoEm === null && (p.unidadeBaseId === id || p.unidadeEntradaId === id || p.unidadeSaidaId === id)
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
      empresaId: null,
      filialId: null,
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
  async listarPorEmpresa(empresaId: string): Promise<PontoEstoque[]> {
    await delay();
    return mockPontosEstoque.filter(
      (p) => p.deletadoEm === null && p.empresaId === empresaId
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

    // 4. Converter para unidade base (usando conversão product-aware)
    let quantidadeConvertidaBase: number;
    try {
      quantidadeConvertidaBase = unidadeMedidaService.converterQuantidade(
        data.quantidadeInformada, data.unidadeMovimentacaoId, produto.unidadeBaseId, produto.id
      );
    } catch (e: any) {
      return { sucesso: false, mensagem: `Erro na conversão: ${e.message}` };
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
      contratoId: null, romaneioId: null,
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
      id: `moeda${Date.now()}`, grupoId: ctx.grupoId, empresaId: null, filialId: null,
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
      id: `cot${Date.now()}a`, grupoId: "g1", empresaId: "e1", filialId: null,
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
      id: `cot${Date.now()}b`, grupoId: "g1", empresaId: "e1", filialId: null,
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
  async listarPorEmpresa(empresaId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter(
      (c) => c.deletadoEm === null && c.empresaId === empresaId
    );
  },
  async listarTodos(grupoId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter((c) => c.deletadoEm === null && c.grupoId === grupoId);
  },
  gerarNumeroContrato(grupoId: string): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `CTR-${yyyy}${mm}-`;
    const existingThisMonth = mockContratos.filter(
      (c) => c.deletadoEm === null && c.grupoId === grupoId && c.numeroContrato.startsWith(prefix)
    );
    let seq = existingThisMonth.length + 1;
    let numero = `${prefix}${String(seq).padStart(4, "0")}`;
    // Conflict check
    while (mockContratos.some((c) => c.deletadoEm === null && c.numeroContrato === numero)) {
      seq++;
      numero = `${prefix}${String(seq).padStart(4, "0")}`;
    }
    return numero;
  },
  async salvar(
    data: Partial<Contrato>,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<Contrato> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockContratos.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      // Allow override of numero only if explicitly different (log as critical)
      if (data.numeroContrato && data.numeroContrato !== existing.numeroContrato) {
        console.warn(`[AUDIT] Número do contrato alterado manualmente: ${existing.numeroContrato} → ${data.numeroContrato}`);
      }
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: "u1", deletadoEm: null, deletadoPor: null,
      });
      return existing;
    }
    // Auto-generate number if not provided
    const numeroContrato = this.gerarNumeroContrato(ctx.grupoId);
    // Convert quantity to base
    const produto = mockProdutos.find((p) => p.id === data.produtoId);
    let unidadeNegociacaoId = data.unidadeNegociacaoId ?? "";
    if (!unidadeNegociacaoId && produto) {
      unidadeNegociacaoId = data.tipoContrato === "COMPRA"
        ? produto.unidadeEntradaId
        : produto.unidadeSaidaId;
    }
    const unidadeNeg = mockUnidadesMedida.find((u) => u.id === unidadeNegociacaoId);
    const unidadeBase = produto ? mockUnidadesMedida.find((u) => u.id === produto.unidadeBaseId) : undefined;
    let quantidadeBaseTotal = data.quantidadeTotal ?? 0;
    if (unidadeNeg && unidadeBase && unidadeBase.fatorBase > 0) {
      quantidadeBaseTotal = ((data.quantidadeTotal ?? 0) * unidadeNeg.fatorBase) / unidadeBase.fatorBase;
    }

    const novo: Contrato = {
      id: `ctr${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      numeroContrato,
      tipoContrato: data.tipoContrato ?? "COMPRA",
      pessoaId: data.pessoaId ?? "",
      produtoId: data.produtoId ?? "",
      unidadeNegociacaoId,
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
      filialOperacaoId: data.filialOperacaoId ?? null,
      filialOrigemId: data.filialOrigemId ?? null,
      filialDestinoId: data.filialDestinoId ?? null,
      status: "ABERTO",
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratos.push(novo);

    // Auto-create estoque_transito
    estoqueTransitoService.criarParaContrato(novo, ctx);

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
      contratoId: contrato.id, romaneioId: entrega.id,
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
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
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
    // Enterprise entity - filter by empresa only
    return mockCondicaoDescontoModelos.filter(
      (m) => m.deletadoEm === null && m.empresaId === empresaId
    );
  },
  async listarPorEmpresa(empresaId: string): Promise<CondicaoDescontoModelo[]> {
    await delay();
    return mockCondicaoDescontoModelos.filter(
      (m) => m.deletadoEm === null && m.empresaId === empresaId
    );
  },
  async listarTodos(): Promise<CondicaoDescontoModelo[]> {
    await delay();
    return mockCondicaoDescontoModelos.filter((m) => m.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    // Enterprise entity - check by empresa only
    return mockCondicaoDescontoModelos.some(
      (m) => m.deletadoEm === null && m.empresaId === empresaId &&
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
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
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
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
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
    // Corporate entity - list all
    return mockClassificacaoTipos.filter((t) => t.deletadoEm === null);
  },
  async listarTodos(): Promise<ClassificacaoTipo[]> {
    await delay();
    return mockClassificacaoTipos.filter((t) => t.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    // Corporate entity - check across group
    return mockClassificacaoTipos.some(
      (ct) => ct.deletadoEm === null && ct.descricao.toLowerCase() === t && ct.id !== excludeId
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
      grupoId: ctx.grupoId, empresaId: null, filialId: null,
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
  async listarPorProdutoEmpresa(produtoId: string, empresaId: string): Promise<ProdutoClassificacao[]> {
    await delay();
    return mockProdutoClassificacoes.filter(
      (p) => p.deletadoEm === null && p.produtoId === produtoId && p.empresaId === empresaId
    );
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
  async excluirPorProdutoETipo(produtoId: string, classificacaoTipoId: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    mockClassificacaoDescontos
      .filter((d) => d.deletadoEm === null && d.produtoId === produtoId && d.classificacaoTipoId === classificacaoTipoId)
      .forEach((d) => { d.deletadoEm = now; d.deletadoPor = "u1"; d.atualizadoEm = now; d.atualizadoPor = "u1"; });
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

// ============================================================
// Financeiro — Contas
// ============================================================
export const financeiroContaService = {
  async listar(empresaId: string, filialId: string, filtros?: {
    tipo?: TipoConta;
    status?: StatusConta;
    pessoaId?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<FinanceiroConta[]> {
    await delay();
    let list = mockFinanceiroContas.filter(
      (c) => c.deletadoEm === null && c.empresaId === empresaId && c.filialId === filialId
    );
    if (filtros?.tipo) list = list.filter((c) => c.tipo === filtros.tipo);
    if (filtros?.status) list = list.filter((c) => c.status === filtros.status);
    if (filtros?.pessoaId) list = list.filter((c) => c.pessoaId === filtros.pessoaId);
    if (filtros?.dataInicio) list = list.filter((c) => c.dataEmissao >= filtros.dataInicio!);
    if (filtros?.dataFim) list = list.filter((c) => c.dataEmissao <= filtros.dataFim!);
    return list;
  },
  async listarPorContrato(contratoId: string): Promise<FinanceiroConta[]> {
    await delay();
    const contrato = mockContratos.find((c) => c.id === contratoId && c.deletadoEm === null);
    if (!contrato) return [];
    return mockFinanceiroContas.filter(
      (c) => c.deletadoEm === null && c.documentoReferencia === contrato.numeroContrato
    );
  },
  async obterPorId(id: string): Promise<FinanceiroConta | undefined> {
    await delay();
    return mockFinanceiroContas.find((c) => c.id === id && c.deletadoEm === null);
  },
  async salvar(data: Partial<FinanceiroConta>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<FinanceiroConta> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockFinanceiroContas.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: "u1" });
      return existing;
    }
    const nova: FinanceiroConta = {
      id: `fc${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      tipo: data.tipo ?? "PAGAR",
      pessoaId: data.pessoaId ?? "",
      descricao: data.descricao ?? "",
      dataEmissao: data.dataEmissao ?? new Date().toISOString().slice(0, 10),
      valorTotal: data.valorTotal ?? 0,
      status: "ABERTO",
      origem: data.origem ?? "MANUAL",
      documentoReferencia: data.documentoReferencia ?? "",
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroContas.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockFinanceiroContas.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = "u1"; c.atualizadoEm = now; c.atualizadoPor = "u1"; }
  },
  async atualizarStatus(contaId: string): Promise<void> {
    await delay(100);
    const conta = mockFinanceiroContas.find((c) => c.id === contaId && c.deletadoEm === null);
    if (!conta) return;
    const parcelas = mockFinanceiroParcelas.filter((p) => p.contaId === contaId && p.deletadoEm === null);
    if (parcelas.length === 0) { conta.status = "ABERTO"; return; }
    const todasPagas = parcelas.every((p) => p.status === "PAGO");
    const algumaPaga = parcelas.some((p) => p.status === "PAGO" || p.status === "PARCIAL");
    if (todasPagas) conta.status = "PAGO";
    else if (algumaPaga) conta.status = "PARCIAL";
    else conta.status = "ABERTO";
    conta.atualizadoEm = new Date().toISOString();
    conta.atualizadoPor = "u1";
  },
};

// ============================================================
// Financeiro — Parcelas
// ============================================================
export const financeiroParcelaService = {
  async listarPorConta(contaId: string): Promise<FinanceiroParcela[]> {
    await delay();
    return mockFinanceiroParcelas.filter((p) => p.deletadoEm === null && p.contaId === contaId)
      .sort((a, b) => a.numeroParcela - b.numeroParcela);
  },
  async listarPorContas(contaIds: string[]): Promise<FinanceiroParcela[]> {
    await delay();
    return mockFinanceiroParcelas
      .filter((p) => p.deletadoEm === null && contaIds.includes(p.contaId))
      .sort((a, b) => a.numeroParcela - b.numeroParcela);
  },
  async gerarParcelas(
    contaId: string, numParcelas: number, intervaloDias: number, valorTotal: number,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<FinanceiroParcela[]> {
    await delay(300);
    const now = new Date().toISOString();
    // Remove parcelas antigas pendentes
    mockFinanceiroParcelas
      .filter((p) => p.contaId === contaId && p.deletadoEm === null && p.status === "PENDENTE")
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = "u1"; });
    const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
    const novas: FinanceiroParcela[] = [];
    for (let i = 0; i < numParcelas; i++) {
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + intervaloDias * (i + 1));
      const val = i === numParcelas - 1 ? valorTotal - valorParcela * (numParcelas - 1) : valorParcela;
      const parcela: FinanceiroParcela = {
        id: `fp${Date.now()}${i}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        contaId, numeroParcela: i + 1,
        dataVencimento: vencimento.toISOString().slice(0, 10),
        valorParcela: val, valorPago: 0, saldoParcela: val, status: "PENDENTE",
        criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      novas.push(parcela);
    }
    mockFinanceiroParcelas.push(...novas);
    return novas;
  },
  async gerarParcelasCustomizadas(
    contaId: string,
    parcelasInput: { numeroParcela: number; dataVencimento: string; valorParcela: number }[],
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<FinanceiroParcela[]> {
    await delay(300);
    const now = new Date().toISOString();
    // Remove parcelas antigas pendentes
    mockFinanceiroParcelas
      .filter((p) => p.contaId === contaId && p.deletadoEm === null && p.status === "PENDENTE")
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = "u1"; });
    const novas: FinanceiroParcela[] = [];
    for (const input of parcelasInput) {
      const parcela: FinanceiroParcela = {
        id: `fp${Date.now()}${input.numeroParcela}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        contaId, numeroParcela: input.numeroParcela,
        dataVencimento: input.dataVencimento,
        valorParcela: input.valorParcela, valorPago: 0, saldoParcela: input.valorParcela, status: "PENDENTE",
        criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      novas.push(parcela);
    }
    mockFinanceiroParcelas.push(...novas);
    return novas;
  },
  async excluirPorConta(contaId: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    mockFinanceiroParcelas
      .filter((p) => p.contaId === contaId && p.deletadoEm === null)
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = "u1"; });
  },
};

// ============================================================
// Financeiro — Baixas
// ============================================================
export const financeiroBaixaService = {
  async listarPorConta(contaId: string): Promise<FinanceiroBaixa[]> {
    await delay();
    const parcelaIds = mockFinanceiroParcelas
      .filter((p) => p.contaId === contaId && p.deletadoEm === null)
      .map((p) => p.id);
    return mockFinanceiroBaixas.filter((b) => b.deletadoEm === null && parcelaIds.includes(b.parcelaId));
  },
  async registrar(
    data: { parcelaId: string; valorPago: number; formaPagamento: FormaPagamento; dataPagamento: string; observacoes: string },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<FinanceiroBaixa> {
    await delay(400);
    const now = new Date().toISOString();
    const baixa: FinanceiroBaixa = {
      id: `fb${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      parcelaId: data.parcelaId,
      dataPagamento: data.dataPagamento || now,
      valorPago: data.valorPago,
      formaPagamento: data.formaPagamento,
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroBaixas.push(baixa);
    // Atualizar parcela
    const parcela = mockFinanceiroParcelas.find((p) => p.id === data.parcelaId && p.deletadoEm === null);
    if (parcela) {
      parcela.valorPago += data.valorPago;
      parcela.saldoParcela = parcela.valorParcela - parcela.valorPago;
      if (parcela.saldoParcela <= 0) {
        parcela.saldoParcela = 0;
        parcela.status = "PAGO";
      } else {
        parcela.status = "PARCIAL";
      }
      parcela.atualizadoEm = now;
      parcela.atualizadoPor = "u1";
      // Atualizar status da conta
      await financeiroContaService.atualizarStatus(parcela.contaId);
    }
    return baixa;
  },
  async listarTodas(empresaId: string, filialId: string): Promise<FinanceiroBaixa[]> {
    await delay();
    return mockFinanceiroBaixas.filter((b) => b.deletadoEm === null && b.empresaId === empresaId && b.filialId === filialId);
  },
};

// ============================================================
// Financeiro — Bancos
// ============================================================
export const financeiroBancoService = createCorporateCrudService<FinanceiroBanco>(mockFinanceiroBancos as any, "fb_banco");

// ============================================================
// Financeiro — Tipo de Contas
// ============================================================
export const financeiroTipoContaService = createCorporateCrudService<FinanceiroTipoConta>(mockFinanceiroTipoContas as any, "ftc");

// ============================================================
// Financeiro — Contas Financeiras
// ============================================================
export const financeiroContaFinanceiraService = {
  async listar(empresaId: string, filialId: string): Promise<FinanceiroContaFinanceira[]> {
    await delay();
    return mockFinanceiroContasFinanceiras.filter((c) => c.deletadoEm === null && c.empresaId === empresaId && c.filialId === filialId);
  },
  async listarTodos(): Promise<FinanceiroContaFinanceira[]> {
    await delay();
    return mockFinanceiroContasFinanceiras.filter((c) => c.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    return mockFinanceiroContasFinanceiras.some(
      (c) => c.deletadoEm === null && c.empresaId === empresaId && c.filialId === filialId && c.descricao.toLowerCase() === t && c.id !== excludeId
    );
  },
  async salvar(data: Partial<FinanceiroContaFinanceira>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<FinanceiroContaFinanceira> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockFinanceiroContasFinanceiras.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.tipoContaId = data.tipoContaId ?? existing.tipoContaId;
      existing.permiteSaldoNegativo = data.permiteSaldoNegativo ?? existing.permiteSaldoNegativo;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.bancoId = data.bancoId !== undefined ? data.bancoId : existing.bancoId;
      existing.agencia = data.agencia ?? existing.agencia;
      existing.contaCorrente = data.contaCorrente ?? existing.contaCorrente;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: FinanceiroContaFinanceira = {
      id: `fcf${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      descricao: (data.descricao ?? "").trim(),
      tipoContaId: data.tipoContaId ?? "",
      saldoAtual: data.saldoAtual ?? 0,
      permiteSaldoNegativo: data.permiteSaldoNegativo ?? false,
      ativo: data.ativo ?? true,
      bancoId: data.bancoId ?? null,
      agencia: data.agencia ?? "",
      contaCorrente: data.contaCorrente ?? "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroContasFinanceiras.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockFinanceiroContasFinanceiras.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = "u1"; c.atualizadoEm = now; c.atualizadoPor = "u1"; }
  },
  atualizarSaldo(id: string, delta: number): void {
    const c = mockFinanceiroContasFinanceiras.find((c) => c.id === id && c.deletadoEm === null);
    if (c) {
      c.saldoAtual += delta;
      c.atualizadoEm = new Date().toISOString();
      c.atualizadoPor = "u1";
    }
  },
};

// ============================================================
// Financeiro — Tipos de Lançamento
// ============================================================
export const financeiroTipoLancamentoService = {
  async listar(empresaId: string, filialId: string): Promise<FinanceiroTipoLancamento[]> {
    await delay();
    // Corporate entity - list all
    return mockFinanceiroTiposLancamento.filter((t) => t.deletadoEm === null);
  },
  async listarTodos(): Promise<FinanceiroTipoLancamento[]> {
    await delay();
    return mockFinanceiroTiposLancamento.filter((t) => t.deletadoEm === null);
  },
  async descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = descricao.trim().toLowerCase();
    // Corporate entity - check across group
    return mockFinanceiroTiposLancamento.some(
      (tl) => tl.deletadoEm === null && tl.descricao.toLowerCase() === t && tl.id !== excludeId
    );
  },
  async salvar(data: Partial<FinanceiroTipoLancamento>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<FinanceiroTipoLancamento> {
    await delay(400);
    const now = new Date().toISOString();
    const existing = data.id ? mockFinanceiroTiposLancamento.find((t) => t.id === data.id && t.deletadoEm === null) : undefined;
    if (existing) {
      if (!existing.permiteEdicao) throw new Error("Tipo de lançamento de sistema não pode ser editado.");
      existing.descricao = (data.descricao ?? existing.descricao).trim();
      existing.tipoMovimento = data.tipoMovimento ?? existing.tipoMovimento;
      existing.tipoConta = data.tipoConta ?? existing.tipoConta;
      existing.exigeCentroCusto = data.exigeCentroCusto ?? existing.exigeCentroCusto;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = "u1";
      return existing;
    }
    const novo: FinanceiroTipoLancamento = {
      id: `ftl${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(),
      tipoMovimento: data.tipoMovimento ?? "ENTRADA",
      tipoConta: data.tipoConta ?? [],
      origemSistema: false,
      permiteEdicao: true,
      permiteExclusao: true,
      exigeCentroCusto: data.exigeCentroCusto ?? false,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroTiposLancamento.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const t = mockFinanceiroTiposLancamento.find((t) => t.id === id && t.deletadoEm === null);
    if (!t) return { sucesso: false, mensagem: "Não encontrado." };
    if (!t.permiteExclusao) return { sucesso: false, mensagem: "Tipo de lançamento de sistema não pode ser excluído." };
    const now = new Date().toISOString();
    t.deletadoEm = now; t.deletadoPor = "u1"; t.atualizadoEm = now; t.atualizadoPor = "u1";
    return { sucesso: true, mensagem: "Excluído com sucesso." };
  },
};

// ============================================================
// Financeiro — Formas de Pagamento
// ============================================================
export const financeiroFormaPagtoService = createCorporateCrudService<FinanceiroFormaPagto>(mockFinanceiroFormasPagto as any, "ffp");

// ============================================================
// Financeiro — Plano de Contas
// ============================================================
export const financeiroPlanoContaService = createCorporateCrudService<FinanceiroPlanoConta>(mockFinanceiroPlanoContas as any, "fpc");

// ============================================================
// Financeiro — Centros de Custo
// ============================================================
export const financeiroCentroCustoService = createCorporateCrudService<FinanceiroCentroCusto>(mockFinanceiroCentrosCusto as any, "fcc");

// ============================================================
// Financeiro — Movimentações
// ============================================================
export const financeiroMovimentacaoService = {
  async listar(empresaId: string, filialId: string): Promise<FinanceiroMovimentacao[]> {
    await delay();
    return mockFinanceiroMovimentacoes
      .filter((m) => m.deletadoEm === null && m.empresaId === empresaId && m.filialId === filialId)
      .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime());
  },
  async listarPorParcela(parcelaId: string): Promise<FinanceiroMovimentacao[]> {
    await delay();
    return mockFinanceiroMovimentacoes.filter((m) => m.deletadoEm === null && m.parcelaId === parcelaId);
  },
  async listarPorConta(contaId: string): Promise<FinanceiroMovimentacao[]> {
    await delay();
    const parcelaIds = mockFinanceiroParcelas.filter((p) => p.contaId === contaId && p.deletadoEm === null).map((p) => p.id);
    return mockFinanceiroMovimentacoes.filter((m) => m.deletadoEm === null && m.parcelaId && parcelaIds.includes(m.parcelaId));
  },
  async registrar(
    data: {
      contaFinanceiraId: string;
      tipoLancamentoId: string;
      formaPagamentoId: string;
      planoContaId?: string | null;
      centroCustoId?: string | null;
      dataMovimento: string;
      valor: number;
      numeroDocumento: string;
      historico: string;
      contaOrigemId?: string | null;
      contaDestinoId?: string | null;
      parcelaId?: string | null;
      pessoaId?: string | null;
    },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: FinanceiroMovimentacao }> {
    await delay(400);
    const now = new Date().toISOString();

    // Get tipo lancamento
    const tipoLanc = mockFinanceiroTiposLancamento.find((t) => t.id === data.tipoLancamentoId && t.deletadoEm === null);
    if (!tipoLanc) return { sucesso: false, mensagem: "Tipo de lançamento não encontrado." };

    const tipoMovimento = tipoLanc.tipoMovimento;

    // Handle transfer
    if (tipoMovimento === "TRANSFERENCIA") {
      if (!data.contaOrigemId || !data.contaDestinoId) return { sucesso: false, mensagem: "Informe conta origem e destino." };
      const contaOrigem = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaOrigemId && c.deletadoEm === null);
      const contaDestino = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaDestinoId && c.deletadoEm === null);
      if (!contaOrigem || !contaDestino) return { sucesso: false, mensagem: "Conta origem ou destino não encontrada." };
      if (!contaOrigem.permiteSaldoNegativo && contaOrigem.saldoAtual - data.valor < 0) {
        return { sucesso: false, mensagem: "Saldo insuficiente na conta origem." };
      }
      contaOrigem.saldoAtual -= data.valor;
      contaDestino.saldoAtual += data.valor;
    } else {
      // ENTRADA or SAIDA
      const contaFin = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaFinanceiraId && c.deletadoEm === null);
      if (!contaFin) return { sucesso: false, mensagem: "Conta financeira não encontrada." };
      if (tipoMovimento === "ENTRADA") {
        contaFin.saldoAtual += data.valor;
      } else {
        if (!contaFin.permiteSaldoNegativo && contaFin.saldoAtual - data.valor < 0) {
          return { sucesso: false, mensagem: "Saldo insuficiente. Conta não permite saldo negativo." };
        }
        contaFin.saldoAtual -= data.valor;
      }
    }

    const mov: FinanceiroMovimentacao = {
      id: `fmov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contaFinanceiraId: data.contaFinanceiraId,
      tipoLancamentoId: data.tipoLancamentoId,
      tipoMovimento,
      formaPagamentoId: data.formaPagamentoId,
      planoContaId: data.planoContaId ?? null,
      centroCustoId: data.centroCustoId ?? null,
      dataMovimento: data.dataMovimento,
      valor: data.valor,
      numeroDocumento: data.numeroDocumento,
      historico: data.historico,
      contaOrigemId: data.contaOrigemId ?? null,
      contaDestinoId: data.contaDestinoId ?? null,
      parcelaId: data.parcelaId ?? null,
      pessoaId: data.pessoaId ?? null,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroMovimentacoes.push(mov);

    // If baixa conta pagar/receber — update parcela
    if (data.parcelaId) {
      const parcela = mockFinanceiroParcelas.find((p) => p.id === data.parcelaId && p.deletadoEm === null);
      if (parcela) {
        parcela.valorPago += data.valor;
        parcela.saldoParcela = parcela.valorParcela - parcela.valorPago;
        if (parcela.saldoParcela <= 0) { parcela.saldoParcela = 0; parcela.status = "PAGO"; }
        else { parcela.status = "PARCIAL"; }
        parcela.atualizadoEm = now; parcela.atualizadoPor = "u1";
        await financeiroContaService.atualizarStatus(parcela.contaId);
      }
    }

    // If adiantamento a fornecedor
    if (tipoLanc.descricao === "ADIANTAMENTO A FORNECEDOR" && data.pessoaId) {
      const adiant: FinanceiroAdiantamento = {
        id: `fad${Date.now()}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        pessoaId: data.pessoaId,
        contratoId: null,
        movimentacaoFinanceiraId: mov.id,
        dataAdiantamento: data.dataMovimento,
        valorAdiantamento: data.valor,
        saldoUtilizado: 0,
        saldoRestante: data.valor,
        status: "ABERTO",
        criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      mockFinanceiroAdiantamentos.push(adiant);
    }

    return { sucesso: true, mensagem: "Movimentação registrada com sucesso.", movimentacao: mov };
  },
};

// ============================================================
// Financeiro — Adiantamentos
// ============================================================
export const financeiroAdiantamentoService = {
  async listar(empresaId: string, filialId: string): Promise<FinanceiroAdiantamento[]> {
    await delay();
    return mockFinanceiroAdiantamentos.filter((a) => a.deletadoEm === null && a.empresaId === empresaId && a.filialId === filialId);
  },
  async listarPorPessoa(pessoaId: string): Promise<FinanceiroAdiantamento[]> {
    await delay();
    return mockFinanceiroAdiantamentos.filter((a) => a.deletadoEm === null && a.pessoaId === pessoaId);
  },
};

// ============================================================
// Motoristas
// ============================================================
import {
  motoristas as mockMotoristas,
  veiculos as mockVeiculos,
  romaneios as mockRomaneios,
  romaneioPesagens as mockRomaneioPesagens,
  contratoLiquidacoes as mockContratoLiquidacoes,
} from "./mock-data";
import type { Motorista, Veiculo, Romaneio, StatusRomaneio, RomaneioPesagem, TipoPesagem, ContratoLiquidacao, StatusLiquidacao } from "./mock-data";

export const motoristaService = {
  async listar(empresaId: string, filialId: string): Promise<Motorista[]> {
    await delay();
    // Motoristas can be shared across filiais - filter by empresa only
    return mockMotoristas.filter((m) => m.deletadoEm === null && m.empresaId === empresaId);
  },
  async buscarPorNome(empresaId: string, filialId: string, termo: string): Promise<Motorista[]> {
    await delay();
    const t = termo.toLowerCase();
    return mockMotoristas.filter((m) => m.deletadoEm === null && m.empresaId === empresaId && m.nome.toLowerCase().includes(t));
  },
  async salvar(data: Partial<Motorista>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Motorista> {
    await delay();
    const now = new Date().toISOString();
    if (data.id) {
      const existing = mockMotoristas.find((m) => m.id === data.id);
      if (existing) { Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: "u1" }); return existing; }
    }
    const novo: Motorista = {
      id: `mot${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      nome: data.nome || "", documento: data.documento || "", telefone: data.telefone || "",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockMotoristas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const m = mockMotoristas.find((x) => x.id === id);
    if (m) { m.deletadoEm = new Date().toISOString(); m.deletadoPor = "u1"; }
  },
};

// ============================================================
// Veículos
// ============================================================
export const veiculoService = {
  async listar(empresaId: string, filialId: string): Promise<Veiculo[]> {
    await delay();
    // Veículos can be shared across filiais - filter by empresa only
    return mockVeiculos.filter((v) => v.deletadoEm === null && v.empresaId === empresaId);
  },
  async buscarPorPlaca(empresaId: string, filialId: string, termo: string): Promise<Veiculo[]> {
    await delay();
    const t = termo.toUpperCase();
    return mockVeiculos.filter((v) => v.deletadoEm === null && v.empresaId === empresaId && v.placa.toUpperCase().includes(t));
  },
  async salvar(data: Partial<Veiculo>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Veiculo> {
    await delay();
    const now = new Date().toISOString();
    if (data.id) {
      const existing = mockVeiculos.find((v) => v.id === data.id);
      if (existing) { Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: "u1" }); return existing; }
    }
    const novo: Veiculo = {
      id: `veic${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      placa: data.placa || "", tipoVeiculo: data.tipoVeiculo || "", transportadora: data.transportadora || "",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockVeiculos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const v = mockVeiculos.find((x) => x.id === id);
    if (v) { v.deletadoEm = new Date().toISOString(); v.deletadoPor = "u1"; }
  },
};

// ============================================================
// Romaneios
// ============================================================
export const romaneioService = {
  async listar(empresaId: string, filialId: string): Promise<Romaneio[]> {
    await delay();
    return mockRomaneios.filter((r) => r.deletadoEm === null && r.empresaId === empresaId && r.filialId === filialId);
  },
  async listarPorContrato(contratoId: string): Promise<Romaneio[]> {
    await delay();
    return mockRomaneios.filter((r) => r.deletadoEm === null && r.contratoId === contratoId);
  },
  async listarFinalizadosPorContrato(contratoId: string): Promise<Romaneio[]> {
    await delay();
    return mockRomaneios.filter((r) => r.deletadoEm === null && r.contratoId === contratoId && r.status === "FINALIZADO");
  },
  async obterPorId(id: string): Promise<Romaneio | undefined> {
    await delay();
    return mockRomaneios.find((r) => r.id === id && r.deletadoEm === null);
  },
  async salvar(data: Partial<Romaneio>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Romaneio> {
    await delay();
    const now = new Date().toISOString();
    if (data.id) {
      const existing = mockRomaneios.find((r) => r.id === data.id);
      if (existing) {
        Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: "u1" });
        return existing;
      }
    }
    // Determinar unidadeRomaneioId a partir do produto
    const produto = mockProdutos.find((p) => p.id === data.produtoId);
    const unidadeRomaneioId = data.unidadeRomaneioId || produto?.unidadeBaseId || "um1";

    const status: StatusRomaneio = data.contratoId ? "ABERTO" : "AGUARDANDO_CONTRATO";
    const novo: Romaneio = {
      id: `rom${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId: data.contratoId || null,
      produtoId: data.produtoId || "",
      motoristaId: data.motoristaId || null,
      motoristaNome: data.motoristaNome || "",
      motoristaDocumento: data.motoristaDocumento || "",
      veiculoId: data.veiculoId || null,
      placaVeiculo: data.placaVeiculo || "",
      pontoEstoqueId: data.pontoEstoqueId || null,
      unidadeRomaneioId,
      status,
      pesoBruto: 0, pesoTara: 0, pesoLiquido: 0,
      classificacaoUmidade: 0, classificacaoImpureza: 0, classificacaoArdidos: 0, classificacaoAvariados: 0,
      pesoLiquidoSecoLimpo: 0,
      observacao: data.observacao || "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockRomaneios.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === id);
    if (r) { r.deletadoEm = new Date().toISOString(); r.deletadoPor = "u1"; }
  },
  async cancelar(id: string): Promise<void> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === id && x.deletadoEm === null);
    if (r) { r.status = "CANCELADO"; r.atualizadoEm = new Date().toISOString(); r.atualizadoPor = "u1"; }
  },
  async finalizar(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === id && x.deletadoEm === null);
    if (!r) return { sucesso: false, mensagem: "Romaneio não encontrado." };
    const now = new Date().toISOString();

    // Validate pesagens: exactly 1 ENTRADA + 1 SAIDA
    const pesagens = mockRomaneioPesagens.filter((p) => p.romaneioId === id);
    const entrada = pesagens.find((p) => p.tipoPesagem === "ENTRADA");
    const saida = pesagens.find((p) => p.tipoPesagem === "SAIDA");
    if (!entrada || !saida) return { sucesso: false, mensagem: "É necessário exatamente 1 pesagem de ENTRADA e 1 de SAÍDA para finalizar." };
    if (entrada.peso < saida.peso) return { sucesso: false, mensagem: "⚠️ Peso de ENTRADA é menor que SAÍDA. Verifique as pesagens." };

    const pesoFinal = r.pesoLiquidoSecoLimpo > 0 ? r.pesoLiquidoSecoLimpo : r.pesoLiquido;
    if (pesoFinal <= 0) return { sucesso: false, mensagem: "Peso líquido final deve ser maior que zero." };
    if (!r.contratoId) return { sucesso: false, mensagem: "Romaneio sem contrato não pode ser finalizado. Vincule a um contrato primeiro." };
    if (!r.pontoEstoqueId) return { sucesso: false, mensagem: "Selecione um ponto de estoque antes de finalizar." };

    const contrato = mockContratos.find((c) => c.id === r.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    const produto = mockProdutos.find((p) => p.id === r.produtoId);
    if (!produto) return { sucesso: false, mensagem: "Produto não encontrado." };

    const ctx = { grupoId: r.grupoId, empresaId: r.empresaId, filialId: r.filialId };

    // FURO 1: Persistir classificações na tabela romaneio_classificacoes
    const classificacoesExistentes = mockRomaneioClassificacoes.filter(
      (rc) => rc.romaneioId === r.id && rc.deletadoEm === null
    );
    if (classificacoesExistentes.length === 0) {
      // Fallback: persistir a partir dos campos inline do romaneio
      const classMap: { tipoId: string; valor: number }[] = [
        { tipoId: "ct1", valor: r.classificacaoUmidade },
        { tipoId: "ct2", valor: r.classificacaoImpureza },
        { tipoId: "ct3", valor: r.classificacaoArdidos },
        { tipoId: "ct5", valor: r.classificacaoAvariados },
      ];
      const itensParaSalvar = classMap
        .filter((c) => c.valor > 0)
        .map((c) => {
          // Buscar percentual de desconto da tabela de descontos do produto
          const faixa = mockClassificacaoDescontos.find(
            (cd) => cd.deletadoEm === null && cd.produtoId === r.produtoId &&
              cd.classificacaoTipoId === c.tipoId &&
              c.valor >= cd.valorMinimo && c.valor < cd.valorMaximo
          );
          return {
            classificacaoTipoId: c.tipoId,
            valorApurado: c.valor,
            percentualDesconto: faixa?.percentualDesconto ?? 0,
          };
        });
      if (itensParaSalvar.length > 0) {
        await romaneioClassificacaoService.salvarClassificacoes(r.id, itensParaSalvar, ctx);
      }
    }

    // FURO 2: Conversão de unidades — converter pesoFinal da unidade do romaneio para unidade base do produto
    const unidadeRomaneioId = r.unidadeRomaneioId || produto.unidadeBaseId;
    let quantidadeEstoque: number;
    let quantidadeContrato: number;

    try {
      quantidadeEstoque = unidadeMedidaService.converterQuantidade(pesoFinal, unidadeRomaneioId, produto.unidadeBaseId, produto.id);
      quantidadeContrato = unidadeMedidaService.converterQuantidade(pesoFinal, unidadeRomaneioId, contrato.unidadeNegociacaoId, produto.id);
    } catch (e: any) {
      return { sucesso: false, mensagem: `Erro na conversão de unidades: ${e.message}` };
    }

    const tipoMov: "ENTRADA" | "SAIDA" = contrato.tipoContrato === "COMPRA" ? "ENTRADA" : "SAIDA";

    // 1. Update estoque em trânsito (FURO 3: usar quantidade convertida para unidade do contrato)
    estoqueTransitoService.registrarMovimento(contrato.id, quantidadeContrato);

    // 2. Create stock movement (uses quantidade convertida para unidade base)
    const mov: MovimentacaoEstoque = {
      id: `mov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: r.produtoId, pontoEstoqueId: r.pontoEstoqueId,
      tipoMovimento: tipoMov,
      quantidadeInformada: pesoFinal,
      unidadeMovimentacaoId: unidadeRomaneioId,
      quantidadeConvertidaBase: quantidadeEstoque,
      dataMovimentacao: now,
      observacao: `Romaneio ${r.id.substring(0, 8)} — Contrato ${contrato.numeroContrato}`,
      contratoId: contrato.id, romaneioId: r.id,
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockMovimentacoesEstoque.push(mov);

    // 3. Update estoque saldo (em unidade base)
    const saldoAtual = estoqueService.obterSaldo(r.produtoId, r.pontoEstoqueId);
    const qtdAtual = saldoAtual?.quantidadeAtual ?? 0;
    const novaQtd = tipoMov === "ENTRADA" ? qtdAtual + quantidadeEstoque : qtdAtual - quantidadeEstoque;
    estoqueService.atualizarSaldo(r.produtoId, r.pontoEstoqueId, novaQtd, ctx);

    // 4. Update contract saldo (em unidade de negociação)
    contrato.quantidadeEntregue += quantidadeContrato;
    contrato.quantidadeSaldo = contrato.quantidadeTotal - contrato.quantidadeEntregue;
    if (contrato.quantidadeSaldo <= 0) contrato.status = "FINALIZADO";
    else if (contrato.quantidadeEntregue > 0) contrato.status = "PARCIAL";
    contrato.atualizadoEm = now; contrato.atualizadoPor = "u1";

    // 5. Finalize romaneio
    r.status = "FINALIZADO";
    r.atualizadoEm = now; r.atualizadoPor = "u1";

    // Build result message with conversion info
    const unRomaneio = unidadeMedidaService.obterPorId(unidadeRomaneioId);
    const unBase = unidadeMedidaService.obterPorId(produto.unidadeBaseId);
    const unContrato = unidadeMedidaService.obterPorId(contrato.unidadeNegociacaoId);
    const msgConversao = unidadeRomaneioId !== produto.unidadeBaseId
      ? ` | Estoque: ${quantidadeEstoque.toFixed(3)} ${unBase?.codigo ?? ""} | Contrato: ${quantidadeContrato.toFixed(3)} ${unContrato?.codigo ?? ""}`
      : "";

    return { sucesso: true, mensagem: `Romaneio finalizado. Peso comercial: ${pesoFinal.toFixed(3)} ${unRomaneio?.codigo ?? ""}${msgConversao}. Estoque atualizado.` };
  },
  async vincularContrato(romaneioId: string, contratoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === romaneioId && x.deletadoEm === null);
    if (!r) return { sucesso: false, mensagem: "Romaneio não encontrado." };
    if (r.status !== "AGUARDANDO_CONTRATO") return { sucesso: false, mensagem: "Apenas romaneios aguardando contrato podem ser vinculados." };
    const contrato = mockContratos.find((c) => c.id === contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    const now = new Date().toISOString();
    r.contratoId = contratoId;
    r.status = "ABERTO";
    r.atualizadoEm = now; r.atualizadoPor = "u1";
    return { sucesso: true, mensagem: "Contrato vinculado ao romaneio." };
  },
  recalcularPesos(romaneioId: string) {
    const pesagens = mockRomaneioPesagens.filter((p) => p.romaneioId === romaneioId);
    const rom = mockRomaneios.find((r) => r.id === romaneioId);
    if (!rom) return;

    const entrada = pesagens.find((p) => p.tipoPesagem === "ENTRADA");
    const saida = pesagens.find((p) => p.tipoPesagem === "SAIDA");

    rom.pesoBruto = entrada ? entrada.peso : 0;
    rom.pesoTara = saida ? saida.peso : 0;
    rom.pesoLiquido = (entrada && saida) ? rom.pesoBruto - rom.pesoTara : 0;
    rom.atualizadoEm = new Date().toISOString();
    rom.atualizadoPor = "u1";
  },
};

// ============================================================
// Romaneio Pesagens
// ============================================================
export const romaneioPesagemService = {
  async listarPorRomaneio(romaneioId: string): Promise<RomaneioPesagem[]> {
    await delay();
    return mockRomaneioPesagens.filter((p) => p.romaneioId === romaneioId);
  },
  async salvar(data: { romaneioId: string; tipoPesagem: TipoPesagem; peso: number }, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<RomaneioPesagem | { erro: string }> {
    await delay();
    // Block duplicate type
    const existing = mockRomaneioPesagens.find((p) => p.romaneioId === data.romaneioId && p.tipoPesagem === data.tipoPesagem);
    if (existing) {
      return { erro: `Já existe uma pesagem de ${data.tipoPesagem === "ENTRADA" ? "ENTRADA" : "SAÍDA"} registrada. Edite a existente.` };
    }
    const now = new Date().toISOString();
    const novo: RomaneioPesagem = {
      id: `rpes${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      romaneioId: data.romaneioId,
      tipoPesagem: data.tipoPesagem,
      peso: data.peso,
      dataHora: now,
      criadoEm: now, criadoPor: "u1",
      editadoEm: null, editadoPor: null,
    };
    mockRomaneioPesagens.push(novo);
    romaneioService.recalcularPesos(data.romaneioId);
    return novo;
  },
  async editarPesagem(pesagemId: string, novoPeso: number, novoTipo?: TipoPesagem): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const pesagem = mockRomaneioPesagens.find((p) => p.id === pesagemId);
    if (!pesagem) return { sucesso: false, mensagem: "Pesagem não encontrada" };
    if (novoPeso <= 0) return { sucesso: false, mensagem: "Peso deve ser maior que zero" };
    // Validate type change — no duplicates
    if (novoTipo && novoTipo !== pesagem.tipoPesagem) {
      const duplicate = mockRomaneioPesagens.find((p) => p.romaneioId === pesagem.romaneioId && p.tipoPesagem === novoTipo && p.id !== pesagemId);
      if (duplicate) return { sucesso: false, mensagem: `Já existe outra pesagem do tipo ${novoTipo}. Não é possível ter duas do mesmo tipo.` };
      pesagem.tipoPesagem = novoTipo;
    }
    const now = new Date().toISOString();
    pesagem.peso = novoPeso;
    pesagem.editadoEm = now;
    pesagem.editadoPor = "u1";
    romaneioService.recalcularPesos(pesagem.romaneioId);
    return { sucesso: true, mensagem: "Pesagem atualizada com sucesso" };
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const idx = mockRomaneioPesagens.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const romaneioId = mockRomaneioPesagens[idx].romaneioId;
      mockRomaneioPesagens.splice(idx, 1);
      romaneioService.recalcularPesos(romaneioId);
    }
  },
};

// ============================================================
// Estoque em Trânsito
// ============================================================
export const estoqueTransitoService = {
  async listar(empresaId: string, filialId: string): Promise<EstoqueTransito[]> {
    await delay();
    return mockEstoquesTransito.filter((t) => t.deletadoEm === null && t.empresaId === empresaId && t.filialId === filialId);
  },
  async listarPorContrato(contratoId: string): Promise<EstoqueTransito | undefined> {
    await delay();
    return mockEstoquesTransito.find((t) => t.contratoId === contratoId && t.deletadoEm === null);
  },
  criarParaContrato(contrato: Contrato, ctx: { grupoId: string; empresaId: string; filialId: string }) {
    const now = new Date().toISOString();
    const tipoMov: "ENTRADA" | "SAIDA" = contrato.tipoContrato === "COMPRA" ? "ENTRADA" : "SAIDA";
    const novo: EstoqueTransito = {
      id: `etrans${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      filialOrigemId: null, filialDestinoId: null,
      contratoId: contrato.id,
      produtoId: contrato.produtoId,
      tipoMovimento: tipoMov,
      quantidadeContratada: contrato.quantidadeTotal,
      quantidadeMovimentada: 0,
      quantidadeSaldo: contrato.quantidadeTotal,
      status: "ATIVO",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockEstoquesTransito.push(novo);
    return novo;
  },
  registrarMovimento(contratoId: string, quantidade: number) {
    const transito = mockEstoquesTransito.find((t) => t.contratoId === contratoId && t.deletadoEm === null && t.status === "ATIVO");
    if (!transito) return;
    const now = new Date().toISOString();
    transito.quantidadeMovimentada += quantidade;
    transito.quantidadeSaldo = transito.quantidadeContratada - transito.quantidadeMovimentada;
    if (transito.quantidadeSaldo <= 0) {
      transito.quantidadeSaldo = 0;
      transito.status = "FINALIZADO";
    }
    transito.atualizadoEm = now; transito.atualizadoPor = "u1";
  },
  obterSaldoTransitoProduto(produtoId: string, empresaId: string, filialId: string): number {
    return mockEstoquesTransito
      .filter((t) => t.deletadoEm === null && t.status === "ATIVO" && t.produtoId === produtoId && t.empresaId === empresaId && t.filialId === filialId)
      .reduce((sum, t) => sum + t.quantidadeSaldo, 0);
  },
};


// ============================================================
// Contrato Liquidação
// ============================================================
export const contratoLiquidacaoService = {
  async listarPorContrato(contratoId: string): Promise<ContratoLiquidacao[]> {
    await delay();
    return mockContratoLiquidacoes.filter((l) => l.deletadoEm === null && l.contratoId === contratoId);
  },

  /**
   * Gera prévia de liquidação calculando automaticamente:
   * - quantidade entregue (soma peso_liquido dos romaneios FINALIZADOS do contrato)
   * - preço unitário (fixo ou média ponderada das fixações)
   * - descontos (condições financeiras do contrato)
   * - valor bruto e líquido
   */
  async gerarPrevia(
    contratoId: string,
    opcaoEncerrar: boolean,
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; liquidacao?: ContratoLiquidacao }> {
    await delay(400);
    const now = new Date().toISOString();

    const contrato = mockContratos.find((c) => c.id === contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    // Check existing active liquidacao
    const existente = mockContratoLiquidacoes.find(
      (l) => l.contratoId === contratoId && l.deletadoEm === null && l.status === "PREVIA"
    );
    if (existente) {
      // Update existing preview
      return this._calcularLiquidacao(existente, contrato, opcaoEncerrar, ctx, now);
    }

    // Create new preview
    const liquidacao: ContratoLiquidacao = {
      id: `liq${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contratoId,
      quantidadeContratada: 0,
      quantidadeEntregue: 0,
      quantidadeLiquidada: 0,
      precoUnitario: 0,
      valorBruto: 0,
      valorDescontos: 0,
      valorLiquido: 0,
      status: "PREVIA",
      dataLiquidacao: now,
      observacao: "",
      criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoLiquidacoes.push(liquidacao);

    return this._calcularLiquidacao(liquidacao, contrato, opcaoEncerrar, ctx, now);
  },

  _calcularLiquidacao(
    liquidacao: ContratoLiquidacao,
    contrato: Contrato,
    opcaoEncerrar: boolean,
    _ctx: { grupoId: string; empresaId: string; filialId: string },
    now: string
  ): { sucesso: boolean; mensagem: string; liquidacao: ContratoLiquidacao } {
    // 1. Quantidade entregue = soma pesoLiquido dos romaneios FINALIZADOS do contrato
    const romaneiosFinalizados = mockRomaneios.filter(
      (r) => r.contratoId === contrato.id && r.deletadoEm === null && r.status === "FINALIZADO"
    );
    const quantidadeEntregue = romaneiosFinalizados.reduce((sum, r) => sum + r.pesoLiquido, 0);

    // 2. Quantidade liquidada
    const quantidadeLiquidada = opcaoEncerrar
      ? quantidadeEntregue
      : Math.min(quantidadeEntregue, contrato.quantidadeTotal);

    // 3. Preço unitário
    let precoUnitario = contrato.precoUnitario;
    if (contrato.tipoPreco === "A_FIXAR") {
      const fixacoes = mockContratoFixacoes.filter(
        (f) => f.contratoId === contrato.id && f.deletadoEm === null
      );
      if (fixacoes.length > 0) {
        const somaQtdFixada = fixacoes.reduce((s, f) => s + f.quantidadeFixada, 0);
        const somaPonderada = fixacoes.reduce((s, f) => s + f.precoFixado * f.quantidadeFixada, 0);
        precoUnitario = somaQtdFixada > 0 ? somaPonderada / somaQtdFixada : 0;
      }
    }

    // 4. Valor bruto
    const valorBruto = Math.round(quantidadeLiquidada * precoUnitario * 100) / 100;

    // 5. Descontos (condições financeiras do contrato)
    const condicoes = mockContratoCondicoes
      .filter((c) => c.contratoId === contrato.id && c.deletadoEm === null)
      .sort((a, b) => a.ordemCalculo - b.ordemCalculo);

    let valorDescontos = 0;
    let valorBase = valorBruto;
    for (const cond of condicoes) {
      let desconto = 0;
      if (cond.tipo === "PERCENTUAL") {
        desconto = valorBase * cond.valor / 100;
      } else {
        desconto = cond.valor;
      }
      valorDescontos += desconto;
      valorBase -= desconto;
    }
    valorDescontos = Math.round(valorDescontos * 100) / 100;

    // 6. Descontos de classificação de qualidade (romaneios)
    let descontoQualidade = 0;
    for (const rom of romaneiosFinalizados) {
      const classificacoes = mockRomaneioClassificacoes.filter(
        (rc) => rc.romaneioId === rom.id && rc.deletadoEm === null
      );
      for (const cl of classificacoes) {
        if (cl.percentualDesconto > 0) {
          descontoQualidade += rom.pesoLiquido * cl.percentualDesconto / 100 * precoUnitario;
        }
      }
    }
    descontoQualidade = Math.round(descontoQualidade * 100) / 100;
    valorDescontos += descontoQualidade;

    // 7. Valor líquido
    const valorLiquido = Math.round((valorBruto - valorDescontos) * 100) / 100;

    // Update liquidação
    liquidacao.quantidadeContratada = contrato.quantidadeTotal;
    liquidacao.quantidadeEntregue = quantidadeEntregue;
    liquidacao.quantidadeLiquidada = quantidadeLiquidada;
    liquidacao.precoUnitario = Math.round(precoUnitario * 100) / 100;
    liquidacao.valorBruto = valorBruto;
    liquidacao.valorDescontos = valorDescontos;
    liquidacao.valorLiquido = valorLiquido;
    liquidacao.atualizadoEm = now;
    liquidacao.atualizadoPor = "u1";

    return { sucesso: true, mensagem: "Prévia de liquidação gerada.", liquidacao };
  },

  async confirmar(
    liquidacaoId: string,
    opcaoTitulos: "ATUALIZAR" | "COMPLEMENTAR",
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay(400);
    const now = new Date().toISOString();

    const liquidacao = mockContratoLiquidacoes.find(
      (l) => l.id === liquidacaoId && l.deletadoEm === null
    );
    if (!liquidacao) return { sucesso: false, mensagem: "Liquidação não encontrada." };
    if (liquidacao.status !== "PREVIA") return { sucesso: false, mensagem: "Apenas liquidações em prévia podem ser confirmadas." };

    const contrato = mockContratos.find((c) => c.id === liquidacao.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    // 1. Update liquidação status
    liquidacao.status = "CONFIRMADA";
    liquidacao.dataLiquidacao = now;
    liquidacao.atualizadoEm = now;
    liquidacao.atualizadoPor = "u1";

    // 2. Encerrar contrato
    contrato.status = "LIQUIDADO";
    contrato.atualizadoEm = now;
    contrato.atualizadoPor = "u1";

    // 3. Zerar estoque em trânsito
    const transito = mockEstoquesTransito.find(
      (t) => t.contratoId === contrato.id && t.deletadoEm === null && t.status === "ATIVO"
    );
    if (transito && transito.quantidadeSaldo > 0) {
      transito.quantidadeSaldo = 0;
      transito.status = "FINALIZADO";
      transito.atualizadoEm = now;
      transito.atualizadoPor = "u1";
    }

    // 4. Ajustar títulos financeiros (sem movimentar caixa)
    const contasDoContrato = mockFinanceiroContas.filter(
      (fc) => fc.deletadoEm === null && fc.documentoReferencia === contrato.numeroContrato
    );

    if (contasDoContrato.length > 0 && opcaoTitulos === "ATUALIZAR") {
      // Adjust existing parcelas to reflect liquidation value
      for (const conta of contasDoContrato) {
        const parcelas = mockFinanceiroParcelas.filter(
          (p) => p.contaId === conta.id && p.deletadoEm === null && p.status === "PENDENTE"
        );
        if (parcelas.length > 0) {
          const valorPorParcela = Math.round((liquidacao.valorLiquido / parcelas.length) * 100) / 100;
          parcelas.forEach((p, i) => {
            p.valorParcela = i === parcelas.length - 1
              ? liquidacao.valorLiquido - valorPorParcela * (parcelas.length - 1)
              : valorPorParcela;
            p.saldoParcela = p.valorParcela - p.valorPago;
            p.atualizadoEm = now;
            p.atualizadoPor = "u1";
          });
          conta.valorTotal = liquidacao.valorLiquido;
          conta.atualizadoEm = now;
          conta.atualizadoPor = "u1";
        }
      }
    } else if (opcaoTitulos === "COMPLEMENTAR") {
      // Create complementary financial entry
      const valorExistente = contasDoContrato.reduce((s, c) => s + c.valorTotal, 0);
      const diferenca = liquidacao.valorLiquido - valorExistente;
      if (Math.abs(diferenca) > 0.01) {
        const tipo = contrato.tipoContrato === "COMPRA" ? "PAGAR" : "RECEBER";
        const novaConta: FinanceiroConta = {
          id: `fc${Date.now()}`,
          grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
          tipo: tipo as any,
          pessoaId: contrato.pessoaId,
          descricao: `Ajuste liquidação contrato ${contrato.numeroContrato}`,
          dataEmissao: now.slice(0, 10),
          valorTotal: Math.abs(diferenca),
          status: "ABERTO",
          origem: "CONTRATO" as any,
          documentoReferencia: contrato.numeroContrato,
          observacoes: `Ajuste gerado pela liquidação do contrato. Diferença: ${diferenca > 0 ? "+" : ""}${diferenca.toFixed(2)}`,
          criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
          deletadoEm: null, deletadoPor: null,
        };
        mockFinanceiroContas.push(novaConta);
        // Generate single parcela
        const parcela: FinanceiroParcela = {
          id: `fp${Date.now()}`,
          grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
          contaId: novaConta.id, numeroParcela: 1,
          dataVencimento: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          valorParcela: Math.abs(diferenca), valorPago: 0, saldoParcela: Math.abs(diferenca),
          status: "PENDENTE",
          criadoEm: now, criadoPor: "u1", atualizadoEm: now, atualizadoPor: "u1",
          deletadoEm: null, deletadoPor: null,
        };
        mockFinanceiroParcelas.push(parcela);
      }
    }

    return { sucesso: true, mensagem: "Liquidação confirmada. Contrato encerrado." };
  },

  async cancelar(liquidacaoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay(200);
    const now = new Date().toISOString();
    const liquidacao = mockContratoLiquidacoes.find(
      (l) => l.id === liquidacaoId && l.deletadoEm === null
    );
    if (!liquidacao) return { sucesso: false, mensagem: "Liquidação não encontrada." };
    if (liquidacao.status !== "PREVIA") return { sucesso: false, mensagem: "Apenas prévias podem ser canceladas." };
    liquidacao.status = "CANCELADA";
    liquidacao.atualizadoEm = now;
    liquidacao.atualizadoPor = "u1";
    return { sucesso: true, mensagem: "Liquidação cancelada." };
  },
};

