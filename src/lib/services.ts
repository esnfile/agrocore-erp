// ============================================================
import { documentoValido, ieValida } from "@/lib/documento-fiscal";
// AgroERP — Service Layer (mock, swap-ready)
// ============================================================
import { MIN_CARACTERES_JUSTIFICATIVA_ESTORNO } from "./constants";
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
  financeiroCheques as mockFinanceiroCheques,
  financeiroCartoes as mockFinanceiroCartoes,
  financeiroPlanoContas as mockFinanceiroPlanoContas,
  financeiroCentrosCusto as mockFinanceiroCentrosCusto,
  financeiroMovimentacoes as mockFinanceiroMovimentacoes,
  financeiroAdiantamentos as mockFinanceiroAdiantamentos,
  adiantamentoSolicitacoes as mockAdiantamentoSolicitacoes,
  movimentacoesAjusteParcela as mockMovAjusteParcela,
  mockParametros,
} from "./mock-data";
import { getUnidadeBaseParaTipo, getCodigoUnidadeBase } from "./mock-data";
import type {
  Empresa, Filial, Grupo, GrupoPessoa, Pessoa,
  TipoProduto, MarcaProduto, DivisaoProduto, SecaoProduto, GrupoProduto, SubgrupoProduto,
  Coeficiente, CoeficienteEmpresa, TabelaPreco, TabelaPrecoEmpresa, ParametroComercial, AplicaSobre,
  Produto, ProdutoEmpresa, ProdutoEmpresaTabelaPreco, TipoBaixaEstoque,
  UnidadeMedida, TipoUnidadeMedida,
  PontoEstoque, TipoPontoEstoque, Estoque, MovimentacaoEstoque, TipoMovimentoEstoque,
  EstoqueTransito, StatusEstoqueTransito,
  Moeda, CotacaoMoeda, PontoEstoqueTipoProduto,
  Contrato, ContratoFixacao, TipoContrato, TipoPreco, StatusContrato,
  CondicaoDescontoModelo, CondicaoDescontoModeloItem, ContratoCondicao, TipoCondicaoDesconto,
  ClassificacaoTipo, UnidadeClassificacao, ProdutoClassificacao, ClassificacaoDesconto, RomaneioClassificacao,
  FinanceiroConta, FinanceiroParcela, FinanceiroBaixa, TipoConta, StatusConta, OrigemConta, StatusParcela, FormaPagamento,
  FinanceiroBanco, FinanceiroTipoConta, FinanceiroContaFinanceira, FinanceiroTipoLancamento,
  FinanceiroFormaPagto, TipoFormaPagamento, FinanceiroPlanoConta, TipoPlanoConta,
  FinanceiroCheque, StatusCheque, FinanceiroCartao, StatusCartao,
  FinanceiroCentroCusto, FinanceiroMovimentacao, TipoMovimentoFinanceiro,
  FinanceiroAdiantamento, StatusAdiantamento, TipoBeneficiarioAdiantamento,
  AdiantamentoSolicitacao, StatusSolicitacaoAdiantamento,
  MovimentacaoAjusteParcela, TipoMovimentacaoAjuste,
} from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// FASE 1 — Sessão do usuário autenticado e permissões
// ------------------------------------------------------------
// ÚNICO ponto de onde sai o valor gravado em criadoPor / atualizadoPor /
// deletadoPor em TODOS os services. A sessão é injetada pelo AuthContext
// logo após o login (definirSessaoAtual) e limpa no logout.
// Nenhuma gravação acontece sem usuário autenticado.
// ============================================================
export type PerfilAcesso = "ADMINISTRADOR" | "OPERADOR" | "CONSULTA";

export interface SessaoUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilAcesso;
  grupoId: string;
  empresaId: string;
  filialId: string;
  empresasPermitidas: string[];
  filiaisPermitidas: string[];
}

let _sessao: SessaoUsuario | null = null;

/** Chamado pelo AuthContext ao autenticar / encerrar sessão. */
export function definirSessaoAtual(sessao: SessaoUsuario | null): void {
  _sessao = sessao;
}

export function sessaoAtual(): SessaoUsuario | null {
  return _sessao;
}

/**
 * Ações sensíveis controladas por perfil — a verificação vive NA CAMADA DE
 * SERVIÇO. A UI pode esconder botões, mas isso é cosmético.
 */
export type AcaoPermissao =
  | "OPERAR"                        // criar/editar registros operacionais
  | "EXCLUIR_CADASTRO_ESTRUTURAL"   // plano de contas, centros de custo, condições, moedas
  | "AUTORIZAR_SUPERVISOR";         // reautenticação de supervisor

const PERMISSOES_POR_PERFIL: Record<PerfilAcesso, AcaoPermissao[]> = {
  ADMINISTRADOR: ["OPERAR", "EXCLUIR_CADASTRO_ESTRUTURAL", "AUTORIZAR_SUPERVISOR"],
  OPERADOR: ["OPERAR"],
  CONSULTA: [],
};

export function podeExecutar(acao: AcaoPermissao): boolean {
  if (!_sessao) return false;
  return PERMISSOES_POR_PERFIL[_sessao.perfil].includes(acao);
}

export function exigirPermissao(acao: AcaoPermissao): void {
  if (!_sessao) throw new Error("Sessão expirada. Entre novamente para continuar.");
  if (!podeExecutar(acao)) {
    throw new Error(
      acao === "EXCLUIR_CADASTRO_ESTRUTURAL"
        ? "Permissão negada: apenas o perfil Administrador pode excluir cadastros estruturais."
        : acao === "AUTORIZAR_SUPERVISOR"
          ? "Permissão negada: seu perfil não autoriza esta operação."
          : "Permissão negada: o perfil Consulta é somente leitura."
    );
  }
}

/**
 * Id do usuário autenticado. Lançar aqui garante que NENHUMA gravação
 * acontece sem sessão válida e que o perfil Consulta nunca grava —
 * toda função de escrita passa por esta chamada.
 */
export function usuarioAtualId(): string {
  if (!_sessao) throw new Error("Sessão expirada. Entre novamente para continuar.");
  if (!PERMISSOES_POR_PERFIL[_sessao.perfil].includes("OPERAR")) {
    throw new Error("Permissão negada: o perfil Consulta é somente leitura.");
  }
  return _sessao.id;
}

// ------------------------------------------------------------
// Tokens de autorização de supervisor.
// A janela de reautenticação devolve um token de uso único; as operações
// sensíveis EXIGEM esse token na CAMADA DE SERVIÇO — esconder o botão na
// tela não é proteção.
// ------------------------------------------------------------
const _autorizacoes = new Map<string, { acao: string; alvoId: string; expiraEm: number }>();

export function emitirTokenAutorizacao(acao: string, alvoId: string): string {
  const token = `aut_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  _autorizacoes.set(token, { acao, alvoId, expiraEm: Date.now() + 5 * 60 * 1000 });
  return token;
}

/** Consome o token (uso único). Lança se ausente, expirado ou de outro alvo. */
export function consumirAutorizacao(token: string | undefined, acao: string, alvoId: string): void {
  const reg = token ? _autorizacoes.get(token) : undefined;
  if (!reg) throw new Error("Operação não autorizada: é necessária autorização de supervisor.");
  _autorizacoes.delete(token!);
  if (reg.acao !== acao || reg.alvoId !== alvoId || reg.expiraEm < Date.now()) {
    throw new Error("Autorização inválida ou expirada. Refaça a autorização de supervisor.");
  }
}

// ============================================================
// Catálogo (read-model síncrono, somente leitura)
// ------------------------------------------------------------
// Telas NÃO importam valores de "./mock-data". Leituras síncronas de
// catálogos (nomes, unidades, produtos...) passam por aqui. Os arrays são
// expostos como ReadonlyArray: nenhuma tela consegue gravar neles.
// Fase 2 (HTTP): este cache será hidratado no bootstrap via API.
// ============================================================
export const catalogo = {
  produtos: (): ReadonlyArray<Produto> => mockProdutos,
  empresas: (): ReadonlyArray<Empresa> => mockEmpresas,
  filiais: (): ReadonlyArray<Filial> => mockFiliais,
  pessoas: (): ReadonlyArray<Pessoa> => mockPessoas,
  moedas: (): ReadonlyArray<Moeda> => mockMoedas,
  cotacoesMoeda: (): ReadonlyArray<CotacaoMoeda> => mockCotacoesMoeda,
  unidadesMedida: (): ReadonlyArray<UnidadeMedida> => mockUnidadesMedida,
  formasPagto: (): ReadonlyArray<FinanceiroFormaPagto> => mockFinanceiroFormasPagto,
  tipoContas: (): ReadonlyArray<FinanceiroTipoConta> => mockFinanceiroTipoContas,
  classificacaoTipos: (): ReadonlyArray<ClassificacaoTipo> => mockClassificacaoTipos,
  produtoClassificacoes: (): ReadonlyArray<ProdutoClassificacao> => mockProdutoClassificacoes,
  classificacaoDescontos: (): ReadonlyArray<ClassificacaoDesconto> => mockClassificacaoDescontos,
  tabelasPreco: (): ReadonlyArray<TabelaPreco> => mockTabelasPreco,
  coeficientes: (): ReadonlyArray<Coeficiente> => mockCoeficientes,
  coeficienteEmpresas: (): ReadonlyArray<CoeficienteEmpresa> => mockCoeficienteEmpresas,
  tabelaPrecoEmpresas: (): ReadonlyArray<TabelaPrecoEmpresa> => mockTabelaPrecoEmpresas,
};

// Helpers puros de unidade (sem estado) — reexportados para as telas.
export { getUnidadeBaseParaTipo, getCodigoUnidadeBase };

// ============================================================
// FASE 2.2 — Cadastros base no banco real (Lovable Cloud)
// ------------------------------------------------------------
// Mesma interface async de antes; a tela não muda. Segurança em duas
// camadas: o serviço recusa sem sessão / perfil Consulta
// (usuarioAtualId / exigirPermissao) e o RLS do banco recusa de novo.
// Soft delete: nunca DELETE físico — só deletado_em/deletado_por.
// ============================================================
const db = () => supabase as any;

function erroBanco(error: { code?: string; message: string }): Error {
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return new Error("Permissão negada: seu perfil não permite gravar este cadastro.");
  }
  if (error.code === "23505") return new Error("Já existe um registro com estes dados (duplicado).");
  if (error.code === "23503") return new Error("Registro vinculado a outro cadastro — operação não permitida.");
  return new Error(error.message);
}

async function dbListar<R = any>(tabela: string, ordem: string, filtro?: (q: any) => any): Promise<R[]> {
  let q = db().from(tabela).select("*").is("deletado_em", null).order(ordem);
  if (filtro) q = filtro(q);
  const { data, error } = await q;
  if (error) throw erroBanco(error);
  return (data ?? []) as R[];
}

async function dbInserir(tabela: string, row: Record<string, unknown>): Promise<any> {
  const uid = usuarioAtualId();
  const { data, error } = await db().from(tabela).insert({ ...row, criado_por: uid, atualizado_por: uid }).select().single();
  if (error) throw erroBanco(error);
  return data;
}

async function dbAtualizar(tabela: string, id: string, patch: Record<string, unknown>): Promise<any> {
  const uid = usuarioAtualId();
  const { data, error } = await db()
    .from(tabela)
    .update({ ...patch, atualizado_em: new Date().toISOString(), atualizado_por: uid })
    .eq("id", id)
    .is("deletado_em", null)
    .select();
  if (error) throw erroBanco(error);
  // RLS em UPDATE não gera erro: filtra silenciosamente. Zero linhas = recusa.
  if (!data || data.length === 0) {
    throw new Error("Permissão negada: seu perfil não permite alterar este registro (ou ele não existe mais).");
  }
  return data[0];
}

async function dbExcluirLogico(tabela: string, id: string): Promise<void> {
  const uid = usuarioAtualId();
  const agora = new Date().toISOString();
  await dbAtualizar(tabela, id, { deletado_em: agora, deletado_por: uid });
}

async function dbContar(tabela: string, filtro: (q: any) => any): Promise<number> {
  const { count, error } = await filtro(db().from(tabela).select("id", { count: "exact", head: true }).is("deletado_em", null));
  if (error) throw erroBanco(error);
  return count ?? 0;
}

const auditoriaDe = (r: any) => ({
  criadoEm: r.criado_em,
  criadoPor: r.criado_por ?? "",
  atualizadoEm: r.atualizado_em,
  atualizadoPor: r.atualizado_por ?? "",
  deletadoEm: r.deletado_em ?? null,
  deletadoPor: r.deletado_por ?? null,
});

const grupoDaSessao = (): string => {
  const g = _sessao?.grupoId ?? "";
  if (!g) throw new Error("Contexto organizacional não carregado. Recarregue a página.");
  return g;
};

// ---- Grupos ----
const mapGrupo = (r: any): Grupo => ({ id: r.id, nome: r.nome, descricao: r.descricao ?? "", ativo: r.ativo, ...auditoriaDe(r) });

export const grupoService = {
  async listar(): Promise<Grupo[]> {
    return (await dbListar("grupos", "nome")).map(mapGrupo);
  },
  async obterPorId(id: string): Promise<Grupo | undefined> {
    return (await dbListar("grupos", "nome", (q) => q.eq("id", id))).map(mapGrupo)[0];
  },
  async salvar(data: Partial<Grupo>): Promise<Grupo> {
    usuarioAtualId();
    const patch = { nome: (data.nome ?? "").trim(), descricao: data.descricao ?? "", ativo: data.ativo ?? true };
    if (data.id) return mapGrupo(await dbAtualizar("grupos", data.id, patch));
    // Multiempresa: cada usuário pertence a um único grupo; o banco recusa
    // criação de grupo pela aplicação (RLS sem política de INSERT).
    throw new Error("Novos grupos empresariais são criados na implantação do sistema, não pela aplicação.");
  },
  async nomeExiste(nome: string, excludeId?: string): Promise<boolean> {
    const alvo = nome.trim().toLowerCase();
    return (await this.listar()).some((g) => g.nome.toLowerCase() === alvo && g.id !== excludeId);
  },
  async possuiEmpresas(id: string): Promise<boolean> {
    return (await dbContar("empresas", (q) => q.eq("grupo_id", id))) > 0;
  },
  async excluir(id: string): Promise<void> {
    await dbExcluirLogico("grupos", id);
  },
};

// ---- Empresas ----
const mapEmpresa = (r: any): Empresa => ({
  id: r.id, grupoId: r.grupo_id, nome: r.nome_razao, descricao: r.descricao ?? "", ativo: r.ativo, ...auditoriaDe(r),
});

export const empresaService = {
  async listar(grupoId?: string): Promise<Empresa[]> {
    return (await dbListar("empresas", "nome_razao", (q) => (grupoId ? q.eq("grupo_id", grupoId) : q))).map(mapEmpresa);
  },
  async obterPorId(id: string): Promise<Empresa | undefined> {
    return (await dbListar("empresas", "nome_razao", (q) => q.eq("id", id))).map(mapEmpresa)[0];
  },
  async salvar(data: Partial<Empresa>): Promise<Empresa> {
    const patch = { nome_razao: (data.nome ?? "").trim(), descricao: data.descricao ?? "", ativo: data.ativo ?? true };
    if (data.id) return mapEmpresa(await dbAtualizar("empresas", data.id, patch));
    return mapEmpresa(await dbInserir("empresas", { ...patch, grupo_id: data.grupoId || grupoDaSessao() }));
  },
  async possuiFiliais(id: string): Promise<boolean> {
    return (await dbContar("filiais", (q) => q.eq("empresa_id", id))) > 0;
  },
  async excluir(id: string): Promise<void> {
    await dbExcluirLogico("empresas", id);
  },
};

// ---- Filiais ----
const mapFilial = (r: any): Filial => ({
  id: r.id, empresaId: r.empresa_id, matrizFilial: r.matriz_filial === "MATRIZ" ? "MATRIZ" : "FILIAL",
  nomeRazao: r.nome_razao, cpfCnpj: r.cpf_cnpj ?? "", ie: r.inscricao_estadual ?? "", email: r.email ?? "",
  telefone: r.telefone ?? "", cep: r.cep ?? "", logradouro: r.endereco ?? "", numero: r.numero_km ?? "",
  complemento: r.complemento ?? "", bairro: r.bairro ?? "", cidade: r.cidade ?? "", uf: r.estado ?? "",
  ativo: r.ativo, ...auditoriaDe(r),
});

const filialParaLinha = (d: Partial<Filial>) => ({
  empresa_id: d.empresaId, matriz_filial: d.matrizFilial ?? "FILIAL", nome_razao: (d.nomeRazao ?? "").trim(),
  cpf_cnpj: (d.cpfCnpj ?? "").trim() || null, inscricao_estadual: (d.ie ?? "").trim() || null,
  email: (d.email ?? "").trim() || null, telefone: (d.telefone ?? "").trim() || null, cep: (d.cep ?? "").trim() || null,
  endereco: (d.logradouro ?? "").trim() || null, numero_km: (d.numero ?? "").trim() || null,
  complemento: (d.complemento ?? "").trim() || null, bairro: (d.bairro ?? "").trim() || null,
  cidade: (d.cidade ?? "").trim() || null, estado: (d.uf ?? "").trim() || null, ativo: d.ativo ?? true,
});

export const filialService = {
  async listar(): Promise<Filial[]> {
    return (await dbListar("filiais", "nome_razao")).map(mapFilial);
  },
  async listarPorEmpresa(empresaId: string): Promise<Filial[]> {
    return (await dbListar("filiais", "nome_razao", (q) => q.eq("empresa_id", empresaId))).map(mapFilial);
  },
  async obterPorId(id: string): Promise<Filial | undefined> {
    return (await dbListar("filiais", "nome_razao", (q) => q.eq("id", id))).map(mapFilial)[0];
  },
  async cpfCnpjExiste(cpfCnpj: string, empresaId: string, excludeId?: string): Promise<boolean> {
    const alvo = cpfCnpj.trim();
    if (!alvo) return false;
    return (await this.listarPorEmpresa(empresaId)).some((f) => f.cpfCnpj === alvo && f.id !== excludeId);
  },
  async possuiMovimentacoes(id: string): Promise<boolean> {
    return (await dbContar("romaneios", (q) => q.eq("filial_id", id))) > 0;
  },
  async salvar(data: Partial<Filial>): Promise<Filial> {
    if (!documentoValido(data.cpfCnpj ?? "")) throw new Error("CNPJ/CPF inválido — dígito verificador não confere.");
    if (!ieValida(data.ie ?? "")) throw new Error("Inscrição Estadual inválida — informe ISENTO ou de 8 a 14 dígitos.");
    const linha = filialParaLinha(data);
    if (data.id) return mapFilial(await dbAtualizar("filiais", data.id, linha));
    return mapFilial(await dbInserir("filiais", { ...linha, grupo_id: grupoDaSessao() }));
  },
  async excluir(id: string): Promise<void> {
    await dbExcluirLogico("filiais", id);
  },
};

// ---- Grupo de Pessoas (nível grupo empresarial) ----
const mapGrupoPessoa = (r: any): GrupoPessoa => ({
  id: r.id, grupoId: r.grupo_id, empresaId: _sessao?.empresaId ?? "", filialId: _sessao?.filialId ?? "",
  descGrupoPessoa: r.descricao, ativo: r.ativo, ...auditoriaDe(r),
});

export const grupoPessoaService = {
  async listar(_empresaId: string, _filialId: string): Promise<GrupoPessoa[]> {
    return (await dbListar("grupos_pessoa", "descricao")).map(mapGrupoPessoa);
  },
  async listarTodos(): Promise<GrupoPessoa[]> {
    return (await dbListar("grupos_pessoa", "descricao")).map(mapGrupoPessoa);
  },
  async nomeExiste(nome: string, _empresaId: string, _filialId: string, excludeId?: string): Promise<boolean> {
    const alvo = nome.trim().toLowerCase();
    return (await this.listarTodos()).some((g) => g.descGrupoPessoa.toLowerCase() === alvo && g.id !== excludeId);
  },
  async salvar(data: Partial<GrupoPessoa>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<GrupoPessoa> {
    const patch = { descricao: (data.descGrupoPessoa ?? "").trim(), ativo: data.ativo ?? true };
    if (data.id) return mapGrupoPessoa(await dbAtualizar("grupos_pessoa", data.id, patch));
    return mapGrupoPessoa(await dbInserir("grupos_pessoa", { ...patch, grupo_id: ctx.grupoId || grupoDaSessao() }));
  },
  async excluir(id: string): Promise<void> {
    await dbExcluirLogico("grupos_pessoa", id);
  },
  async possuiPessoas(id: string): Promise<boolean> {
    return (await dbContar("pessoas", (q) => q.eq("grupo_pessoa_id", id))) > 0;
  },
};

// ---- Pessoas (nível grupo empresarial) ----
const mapPessoa = (r: any): Pessoa => ({
  id: r.id, grupoId: r.grupo_id, empresaId: _sessao?.empresaId ?? "", filialId: _sessao?.filialId ?? "",
  tipoPessoa: r.tipo_pessoa === "PF" ? "PF" : "PJ", grupoPessoaId: r.grupo_pessoa_id ?? "",
  relacaoComercial: r.relacoes ?? [], nomeRazao: r.nome_razao, dataNascimentoAbertura: r.data_nascimento_abertura ?? "",
  cpfCnpj: r.cpf_cnpj ?? "", rgIe: r.inscricao_estadual ?? "", nomeFantasia: r.nome_fantasia ?? "",
  sexo: (r.sexo ?? "") as Pessoa["sexo"], ativo: r.ativo, enderecos: r.enderecos ?? [], contatos: r.contatos ?? [],
  ...auditoriaDe(r),
});

const pessoaParaLinha = (d: Partial<Pessoa>) => {
  const relacoes = d.relacaoComercial ?? [];
  const end = (d.enderecos ?? []).find((e) => e.enderecoPadrao) ?? d.enderecos?.[0];
  const tel = (d.contatos ?? []).find((c) => c.tipoContato === "Telefone" || c.tipoContato === "WhatsApp");
  const mail = (d.contatos ?? []).find((c) => c.tipoContato === "Email");
  return {
    tipo_pessoa: d.tipoPessoa ?? "PF", grupo_pessoa_id: d.grupoPessoaId || null, relacoes,
    relacao_comercial: (relacoes[0] ?? "Cliente").toUpperCase(), eh_motorista: relacoes.includes("Motorista"),
    nome_razao: (d.nomeRazao ?? "").trim(), data_nascimento_abertura: d.dataNascimentoAbertura || null,
    cpf_cnpj: (d.cpfCnpj ?? "").trim() || null, inscricao_estadual: (d.rgIe ?? "").trim() || null,
    nome_fantasia: (d.nomeFantasia ?? "").trim() || null, sexo: d.sexo || null, ativo: d.ativo ?? true,
    enderecos: d.enderecos ?? [], contatos: d.contatos ?? [],
    cidade: end?.cidade || null, estado: end?.estado || null,
    telefone: tel?.descContatoPessoa || null, email: mail?.descContatoPessoa || null,
  };
};

export const pessoaService = {
  async listar(
    _empresaId: string,
    _filialId: string,
    filtros?: { nome?: string; cpfCnpj?: string; tipoPessoa?: string; relacaoComercial?: string; status?: string }
  ): Promise<Pessoa[]> {
    let list = (await dbListar("pessoas", "nome_razao")).map(mapPessoa);
    if (filtros?.nome) {
      const t = filtros.nome.toLowerCase();
      list = list.filter((p) => p.nomeRazao.toLowerCase().includes(t));
    }
    if (filtros?.cpfCnpj) {
      const t = filtros.cpfCnpj.toLowerCase();
      list = list.filter((p) => p.cpfCnpj.toLowerCase().includes(t));
    }
    if (filtros?.tipoPessoa) list = list.filter((p) => p.tipoPessoa === filtros.tipoPessoa);
    if (filtros?.relacaoComercial) list = list.filter((p) => p.relacaoComercial.includes(filtros.relacaoComercial!));
    if (filtros?.status) list = list.filter((p) => p.ativo === (filtros.status === "ativo"));
    return list;
  },
  async cpfCnpjExiste(cpfCnpj: string, _empresaId: string, excludeId?: string): Promise<boolean> {
    const alvo = cpfCnpj.trim();
    if (!alvo) return false;
    const achados = await dbListar("pessoas", "nome_razao", (q) => q.eq("cpf_cnpj", alvo));
    return achados.some((r: any) => r.id !== excludeId);
  },
  async salvar(data: Partial<Pessoa>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Pessoa> {
    const linha = pessoaParaLinha(data);
    if (data.id) return mapPessoa(await dbAtualizar("pessoas", data.id, linha));
    return mapPessoa(await dbInserir("pessoas", { ...linha, grupo_id: ctx.grupoId || grupoDaSessao() }));
  },
  async excluir(id: string): Promise<void> {
    await dbExcluirLogico("pessoas", id);
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
      const userId = usuarioAtualId();
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
        item.deletadoPor = usuarioAtualId();
        item.atualizadoEm = now;
        item.atualizadoPor = usuarioAtualId();
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
      const userId = usuarioAtualId();
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
        item.deletadoPor = usuarioAtualId();
        item.atualizadoEm = now;
        item.atualizadoPor = usuarioAtualId();
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: Coeficiente = {
      id: `coef${Date.now()}`, grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(), ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockCoeficientes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockCoeficientes.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); c.atualizadoEm = now; c.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockCoeficienteEmpresas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const ce = mockCoeficienteEmpresas.find((ce) => ce.id === id && ce.deletadoEm === null);
    if (ce) { ce.deletadoEm = now; ce.deletadoPor = usuarioAtualId(); ce.atualizadoEm = now; ce.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: TabelaPreco = {
      id: `tpreco${Date.now()}`, grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(), ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockTabelasPreco.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockTabelasPreco.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = usuarioAtualId(); t.atualizadoEm = now; t.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const dup = mockTabelaPrecoEmpresas.find(
      (t) => t.deletadoEm === null && t.tabelaPrecoId === tabelaPrecoId && t.empresaId === data.empresaId
    );
    if (dup) throw new Error("Empresa já vinculada a esta tabela de preço.");
    const novo: TabelaPrecoEmpresa = {
      id: `tpe${Date.now()}`, tabelaPrecoId, empresaId: data.empresaId!,
      margemLucroPercentual: data.margemLucroPercentual ?? 0,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockTabelaPrecoEmpresas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockTabelaPrecoEmpresas.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = usuarioAtualId(); t.atualizadoEm = now; t.atualizadoPor = usuarioAtualId(); }
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
        atualizadoEm: now, atualizadoPor: usuarioAtualId(), deletadoEm: null, deletadoPor: null,
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
      tipoUnidade: data.tipoUnidade ?? "PESO",
      unidadeEntradaId: data.unidadeEntradaId ?? "",
      unidadeSaidaId: data.unidadeSaidaId ?? "",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockProdutos.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoEmpresas.push(novo);
    return novo;
  },
  async excluirPorProduto(produtoId: string): Promise<void> {
    const now = new Date().toISOString();
    mockProdutoEmpresas.filter((pe) => pe.produtoId === produtoId && pe.deletadoEm === null).forEach((pe) => {
      pe.deletadoEm = now; pe.deletadoPor = usuarioAtualId();
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: ProdutoEmpresaTabelaPreco = {
      id: `petp${Date.now()}`, produtoEmpresaId,
      tabelaPrecoEmpresaId: data.tabelaPrecoEmpresaId ?? "",
      precoCalculado: data.precoCalculado ?? 0,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoEmpresaTabelasPreco.push(novo);
    return novo;
  },
};

// ============================================================
// MODELO DE UNIDADES — FONTE ÚNICA DE CONVERSÃO (Fase 2)
// ------------------------------------------------------------
// Unidade base = KG (peso), LT (volume), UND. O kg da balança é a VERDADE.
// Fatores universais (TON = 1.000 kg, G = 0,001 kg, ML = 0,001 LT) valem para
// qualquer produto; unidades comerciais (ex.: SC) usam o fator do produto
// (quantidadeEmbalagem de entrada/saída). Espelha public.fator_base() no banco.
// PROIBIDO: converter valor já arredondado ou derivar kg de SC/TON arredondada.
// ============================================================
const FATORES_UNIVERSAIS: Record<string, number> = { KG: 1, LT: 1, UND: 1, TON: 1000, G: 0.001, ML: 0.001 };

export function fatorBasePorUnidade(unidadeId: string, produto: Produto): number {
  const un = mockUnidadesMedida.find((u) => u.id === unidadeId && u.deletadoEm === null);
  if (!un) throw new Error("Unidade não encontrada.");
  if (unidadeId === getUnidadeBaseParaTipo(produto.tipoUnidade)) return 1;
  if (unidadeId === produto.unidadeEntradaId && produto.quantidadeEmbalagemEntrada > 0) return produto.quantidadeEmbalagemEntrada;
  if (unidadeId === produto.unidadeSaidaId && produto.quantidadeEmbalagemSaida > 0) return produto.quantidadeEmbalagemSaida;
  const universal = FATORES_UNIVERSAIS[un.codigo.toUpperCase()];
  if (universal !== undefined) return universal;
  throw new Error(`Unidade "${un.codigo}" não está configurada no produto "${produto.descricao}".`);
}

/** Exibição: SC 2 casas, KG/LT/UND inteiro, TON 3 casas. Nunca recalcula — só formata. */
export function formatarQuantidadeUnidade(valor: number, codigo: string): string {
  const c = (codigo || "").toUpperCase();
  const casas = c === "TON" ? 3 : c === "KG" || c === "LT" || c === "UND" || c === "G" || c === "ML" ? 0 : 2;
  return `${(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })} ${c}`;
}

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
   * produtoId é OBRIGATÓRIO — toda conversão vem do produto.
   * Lógica: origem → unidadeBase (derivada do tipoUnidade) → destino
   */
  converterQuantidade(valor: number, unidadeOrigemId: string, unidadeDestinoId: string, produtoId: string): number {
    // MODELO DE UNIDADES (Fase 2): conversão ÚNICA via fator "base por unidade"
    // (fatorBasePorUnidade). Nunca arredonda — valor exato nos dois sentidos.
    if (unidadeOrigemId === unidadeDestinoId) return valor;
    const unidadeOrigem = mockUnidadesMedida.find((u) => u.id === unidadeOrigemId && u.deletadoEm === null);
    const unidadeDestino = mockUnidadesMedida.find((u) => u.id === unidadeDestinoId && u.deletadoEm === null);
    if (!unidadeOrigem || !unidadeDestino) {
      throw new Error("Unidade de origem ou destino não encontrada.");
    }
    if (unidadeOrigem.tipo !== unidadeDestino.tipo) {
      throw new Error(`Não é possível converter ${unidadeOrigem.tipo} para ${unidadeDestino.tipo}.`);
    }
    const produto = mockProdutos.find((p) => p.id === produtoId && p.deletadoEm === null);
    if (!produto) {
      throw new Error("Produto não encontrado. Conversão requer produto.");
    }
    const fOrig = fatorBasePorUnidade(unidadeOrigemId, produto);
    const fDest = fatorBasePorUnidade(unidadeDestinoId, produto);
    return (valor * fOrig) / fDest;
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
      (p) => p.deletadoEm === null && (p.unidadeEntradaId === id || p.unidadeSaidaId === id)
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
      
      existing.ativo = data.ativo ?? existing.ativo;
      existing.atualizadoEm = now;
      existing.atualizadoPor = usuarioAtualId();
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
      
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockUnidadesMedida.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const u = mockUnidadesMedida.find((u) => u.id === id && u.deletadoEm === null);
    if (u) { u.deletadoEm = now; u.deletadoPor = usuarioAtualId(); u.atualizadoEm = now; u.atualizadoPor = usuarioAtualId(); }
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
    const userId = usuarioAtualId();

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
    if (p) { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId(); }
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
      registro.atualizadoPor = usuarioAtualId();
      return registro;
    }
    registro = {
      id: `est${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId, pontoEstoqueId,
      quantidadeAtual: novaQuantidade,
      custoMedioAtual: null, valorTotalEstoque: null,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    const unidadeBaseId = getUnidadeBaseParaTipo(produto.tipoUnidade);
    const unidadeBase = mockUnidadesMedida.find((u) => u.id === unidadeBaseId && u.deletadoEm === null);
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
        data.quantidadeInformada, data.unidadeMovimentacaoId, unidadeBaseId, produto.id
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: Moeda = {
      id: `moeda${Date.now()}`, grupoId: ctx.grupoId, empresaId: null, filialId: null,
      codigo: (data.codigo ?? "").trim(), descricao: (data.descricao ?? "").trim(),
      simbolo: data.simbolo ?? "", ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockMoedas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    exigirPermissao("EXCLUIR_CADASTRO_ESTRUTURAL");
    await delay();
    const now = new Date().toISOString();
    const m = mockMoedas.find((m) => m.id === id && m.deletadoEm === null);
    if (m) { m.deletadoEm = now; m.deletadoPor = usuarioAtualId(); m.atualizadoEm = now; m.atualizadoPor = usuarioAtualId(); }
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockPontoEstoqueTiposProduto.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockPontoEstoqueTiposProduto.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId(); }
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
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); });
    // Add new
    for (const tpId of tipoProdutoIds) {
      const novo: PontoEstoqueTipoProduto = {
        id: `petp${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        pontoEstoqueId, tipoProdutoId: tpId,
        criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
        deletadoEm: null, deletadoPor: null,
      };
      mockPontoEstoqueTiposProduto.push(novo);
    }
  },
};

// ============================================================
// SALDO DO CONTRATO — FONTE ÚNICA (cache + verdade absoluta)
// ------------------------------------------------------------
// VERDADE: entregue = soma dos romaneios FINALIZADOS vinculados ao contrato
//          (peso comercial: PLSL se > 0, senão peso líquido);
//          saldo = contratado - entregue.
// CACHE:   Contrato.quantidadeEntregue / quantidadeSaldo — atualizados na
//          mesma operação que altera o romaneio (atualizarCacheSaldoContrato).
// EXIBIÇÃO: toda tela recebe contratos já com a VERDADE aplicada
//          (comSaldoDerivado). Se cache ≠ verdade, vale a verdade.
// RECONCILIAÇÃO: reconciliarSaldosContratos() compara e reporta divergências
//          sem corrigir silenciosamente.
// FASE 2 (multi-produto): o contrato terá N itens (tabela `contrato_itens`).
//          Esta função passará a agregar por item (romaneio → item), mantendo
//          a mesma assinatura para as telas.
// ============================================================
export interface SaldoContrato {
  /** Contratado, na unidade de negociação do contrato */
  totalNeg: number;
  /** Entregue (romaneios finalizados), na unidade de negociação */
  entregueNeg: number;
  /** Saldo, na unidade de negociação */
  saldoNeg: number;
  /** Contratado em unidade base (KG/LT/UND) */
  totalBase: number;
  /** Entregue em unidade base */
  entregueBase: number;
  /** Saldo em unidade base */
  saldoBase: number;
}

/**
 * REGRA DE ARREDONDAMENTO DE PESO (Fase 1):
 * Pesos derivados da classificação (PLSL, peso classificado, peso descontado)
 * são ARREDONDADOS PARA KG INTEIRO no ponto de GRAVAÇÃO (half-even / ToEven).
 * O valor armazenado já é o exibido — contratado − entregue = saldo fecha
 * sempre a conta mental do usuário. Exibição nunca arredonda por conta própria.
 */
export function arredondarKg(v: number): number {
  if (!Number.isFinite(v)) return 0;
  const f = Math.floor(v);
  const d = v - f;
  if (Math.abs(d - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1;
  return Math.round(v);
}

function normalizarPesosRomaneio<T extends Partial<Romaneio>>(data: T): T {
  const campos = ["pesoLiquidoSecoLimpo", "pesoClassificado", "totalPesoDescontado"] as const;
  const out = { ...data };
  for (const c of campos) {
    const v = out[c as keyof T];
    if (typeof v === "number") (out as Record<string, unknown>)[c] = arredondarKg(v);
  }
  return out;
}

/** Peso comercial de um romaneio (mesma regra da finalização). */
export function pesoComercialRomaneio(r: { pesoLiquidoSecoLimpo: number; pesoLiquido: number }): number {
  return r.pesoLiquidoSecoLimpo > 0 ? r.pesoLiquidoSecoLimpo : r.pesoLiquido;
}

/** Romaneios que contam como entrega física do contrato. */
/**
 * Romaneios que contam como entrega. Somente FINALIZADO — romaneios
 * CANCELADO e ESTORNADO ficam de fora das somas de verdade absoluta
 * (saldo de contrato e saldo de estoque).
 */
export function romaneiosEntreguesDoContrato(contratoId: string) {
  return mockRomaneios.filter(
    (r) => r.contratoId === contratoId && r.deletadoEm === null && r.status === "FINALIZADO"
  );
}

/** Fator base/unidade de negociação do contrato (1 se não configurado). */
function fatorNegociacaoContrato(contrato: Contrato): { produto: Produto | undefined; fator: number; unBaseId: string | null; unNegId: string | null } {
  const produto = mockProdutos.find((p) => p.id === contrato.produtoId);
  const unBaseId = produto ? getUnidadeBaseParaTipo(produto.tipoUnidade) : null;
  const unNegId = contrato.unidadeNegociacaoId || unBaseId;
  let fator = 1;
  if (produto && unNegId) { try { fator = fatorBasePorUnidade(unNegId, produto); } catch { fator = 1; } }
  return { produto, fator, unBaseId, unNegId };
}

/**
 * Cálculo em KG EXATO (espelha public.calc_tolerancia no banco). Valores de
 * negociação são apenas kg ÷ fator — nunca o contrário, nunca arredondados.
 */
export function calcularToleranciaKg(p: { totalKg: number; entregueKg: number; pesoKg: number; toleranciaPct: number; fator: number }) {
  const saldoKg = p.totalKg - p.entregueKg;
  const excessoKg = Math.max(0, p.pesoKg - saldoKg);
  const limiteKg = (p.totalKg * p.toleranciaPct) / 100;
  const status: AvaliacaoToleranciaContrato["status"] =
    excessoKg <= 1e-6 ? "OK" : excessoKg > limiteKg + 1e-6 ? "EXCEDE" : "DENTRO_TOLERANCIA";
  return { status, saldoKg, excessoKg, limiteKg, excessoNeg: excessoKg / p.fator, limiteNeg: limiteKg / p.fator, saldoFinalKg: saldoKg - p.pesoKg };
}

export function calcularSaldoContrato(contrato: Contrato): SaldoContrato {
  const { produto, fator, unBaseId } = fatorNegociacaoContrato(contrato);
  // Contratado em kg sempre derivado da quantidade negociada × fator (nunca de valor arredondado).
  const totalBase = contrato.quantidadeTotal * fator;
  let entregueBase = 0;
  for (const r of romaneiosEntreguesDoContrato(contrato.id)) {
    const peso = pesoComercialRomaneio(r);
    const unidadeRom = r.unidadeRomaneioId || unBaseId;
    let kg = peso;
    if (produto && unidadeRom) { try { kg = peso * fatorBasePorUnidade(unidadeRom, produto); } catch { kg = peso; } }
    entregueBase += kg;
  }
  return {
    totalNeg: contrato.quantidadeTotal,
    entregueNeg: entregueBase / fator,
    saldoNeg: (totalBase - entregueBase) / fator,
    totalBase,
    entregueBase,
    saldoBase: totalBase - entregueBase,
  };
}

export interface AvaliacaoToleranciaContrato {
  status: "OK" | "DENTRO_TOLERANCIA" | "EXCEDE";
  toleranciaPercentual: number;
  unidadeCodigo: string;
  /** Todos em unidade de NEGOCIAÇÃO do contrato (ex.: SC) — kg ÷ fator. */
  excessoNeg: number;
  limiteNeg: number;
  /** Valores em unidade BASE (kg) — a verdade. */
  excessoBase: number;
  limiteBase: number;
  /** Saldo do contrato após esta entrega, em kg exato. */
  saldoFinalBase: number;
  mensagem: string;
}

/**
 * FONTE ÚNICA da regra de saldo + tolerância do contrato (tela e finalização).
 * Comparação feita em KG exato; unidade de negociação só para exibição.
 */
export function avaliarToleranciaContrato(contrato: Contrato, pesoRomaneio: number, unidadeRomaneioId: string | null): AvaliacaoToleranciaContrato {
  const { produto, fator, unBaseId, unNegId } = fatorNegociacaoContrato(contrato);
  const unRom = unidadeRomaneioId || unBaseId;
  let pesoKg = pesoRomaneio;
  if (produto && unRom) { try { pesoKg = pesoRomaneio * fatorBasePorUnidade(unRom, produto); } catch { pesoKg = pesoRomaneio; } }
  const saldo = calcularSaldoContrato(contrato);
  const tol = contrato.toleranciaPercentualMais ?? 0;
  const r = calcularToleranciaKg({ totalKg: saldo.totalBase, entregueKg: saldo.entregueBase, pesoKg, toleranciaPct: tol, fator });
  const un = (unNegId && unidadeMedidaService.obterPorId(unNegId)?.codigo) || "KG";
  const unBase = (unBaseId && unidadeMedidaService.obterPorId(unBaseId)?.codigo) || "KG";
  const pct = tol.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const dual = (n: number, b: number) =>
    unNegId === unBaseId ? formatarQuantidadeUnidade(b, unBase) : `${formatarQuantidadeUnidade(n, un)} / ${formatarQuantidadeUnidade(b, unBase)}`;
  let mensagem = "";
  if (r.status === "EXCEDE") {
    mensagem = `Excede o contratado além da tolerância de ${pct}% — excesso de ${dual(r.excessoNeg, r.excessoKg)} (limite ${dual(r.limiteNeg, r.limiteKg)}).`;
  } else if (r.status === "DENTRO_TOLERANCIA") {
    mensagem = `Excede o contratado em ${dual(r.excessoNeg, r.excessoKg)} — dentro da tolerância de ${pct}% (limite ${dual(r.limiteNeg, r.limiteKg)}).`;
  }
  return {
    status: r.status, toleranciaPercentual: tol, unidadeCodigo: un,
    excessoNeg: r.excessoNeg, limiteNeg: r.limiteNeg, excessoBase: r.excessoKg, limiteBase: r.limiteKg,
    saldoFinalBase: r.saldoFinalKg, mensagem,
  };
}

/** Cópia do contrato com entregue/saldo substituídos pela VERDADE derivada. */
export function comSaldoDerivado(contrato: Contrato): Contrato {
  const s = calcularSaldoContrato(contrato);
  return { ...contrato, quantidadeEntregue: s.entregueNeg, quantidadeSaldo: s.saldoNeg };
}

/** Atualiza o CACHE armazenado — chamado na mesma operação que altera romaneios. */
function atualizarCacheSaldoContrato(contrato: Contrato): SaldoContrato {
  const s = calcularSaldoContrato(contrato);
  contrato.quantidadeEntregue = s.entregueNeg;
  contrato.quantidadeSaldo = s.saldoNeg;
  return s;
}

export interface DivergenciaSaldoContrato {
  contratoId: string;
  numeroContrato: string;
  cacheEntregue: number;
  verdadeEntregue: number;
  diferenca: number;
  /** true quando algum romaneio ESTORNADO/CANCELADO entrou indevidamente na soma. */
  estornadosContabilizados: boolean;
}

/** Compara cache × verdade. Apenas reporta — nunca corrige silenciosamente. */
export function reconciliarSaldosContratos(grupoId?: string, tolerancia = 0.000001): DivergenciaSaldoContrato[] {
  return mockContratos
    .filter((c) => c.deletadoEm === null && (!grupoId || c.grupoId === grupoId))
    .map((c) => {
      const s = calcularSaldoContrato(c);
      // Validação explícita: nenhum romaneio ESTORNADO/CANCELADO pode continuar
      // contabilizado — nem na soma de entregas, nem no estoque.
      const romaneiosDoContrato = mockRomaneios.filter(
        (r) => r.contratoId === c.id && r.deletadoEm === null
      );
      const desfeitos = romaneiosDoContrato.filter(
        (r) => r.status === "ESTORNADO" || r.status === "CANCELADO"
      );
      const idsEntregues = new Set(romaneiosEntreguesDoContrato(c.id).map((r) => r.id));
      const estornadosContabilizados = desfeitos.some(
        (r) =>
          idsEntregues.has(r.id) ||
          mockMovimentacoesEstoque.some((m) => m.romaneioId === r.id && m.deletadoEm === null)
      );
      return {
        contratoId: c.id,
        numeroContrato: c.numeroContrato,
        cacheEntregue: c.quantidadeEntregue,
        verdadeEntregue: s.entregueNeg,
        diferenca: c.quantidadeEntregue - s.entregueNeg,
        estornadosContabilizados,
      };
    })
    .filter((d) => Math.abs(d.diferenca) > tolerancia || d.estornadosContabilizados);
}

// ============================================================
// Contratos
// ============================================================
export const contratoService = {
  async listar(empresaId: string, filialId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter(
      (c) => c.deletadoEm === null && c.empresaId === empresaId && c.filialId === filialId
    ).map(comSaldoDerivado);
  },
  async listarPorEmpresa(empresaId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter(
      (c) => c.deletadoEm === null && c.empresaId === empresaId
    ).map(comSaldoDerivado);
  },
  async listarTodos(grupoId: string): Promise<Contrato[]> {
    await delay();
    return mockContratos.filter((c) => c.deletadoEm === null && c.grupoId === grupoId).map(comSaldoDerivado);
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
    // A_FIXAR validation: price must be 0
    if (data.tipoPreco === "A_FIXAR" && data.precoUnitario && data.precoUnitario !== 0) {
      data.precoUnitario = 0;
      console.warn("[AUDIT] Contrato A_FIXAR: preço forçado para 0 (provisório).");
    }

    const existing = data.id ? mockContratos.find((c) => c.id === data.id && c.deletadoEm === null) : undefined;
    if (existing) {
      // Never allow manual numero override
      delete (data as any).numeroContrato;
      // Entregue/saldo nunca vêm da tela: são derivados dos romaneios
      delete (data as any).quantidadeEntregue;
      delete (data as any).quantidadeSaldo;
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: usuarioAtualId(), deletadoEm: null, deletadoPor: null,
      });
      atualizarCacheSaldoContrato(existing);
      return comSaldoDerivado(existing);
    }
    // Auto-generate number
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
    let quantidadeBaseTotal = data.quantidadeTotal ?? 0;
    if (produto && unidadeNegociacaoId) {
      try {
        const unidadeBaseId = getUnidadeBaseParaTipo(produto.tipoUnidade);
        quantidadeBaseTotal = unidadeMedidaService.converterQuantidade(
          data.quantidadeTotal ?? 0, unidadeNegociacaoId, unidadeBaseId, produto.id
        );
      } catch { /* keep original value */ }
    }

    const novo: Contrato = {
      id: `ctr${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      numeroContrato,
      codigoInterno: data.codigoInterno ?? null,
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
      toleranciaPercentualMenos: data.toleranciaPercentualMenos ?? null,
      toleranciaPercentualMais: data.toleranciaPercentualMais ?? null,
      filialOperacaoId: data.filialOperacaoId ?? null,
      filialOrigemId: data.filialOrigemId ?? null,
      filialDestinoId: data.filialDestinoId ?? null,
      status: "ABERTO",
      duplicatasGeradas: false,
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    // Entrega física = romaneio vinculado (qualquer status exceto cancelado)
    const hasEntregas = mockRomaneios.some((r) => r.contratoId === id && r.deletadoEm === null && r.status !== "CANCELADO");
    if (hasEntregas) return { sucesso: false, mensagem: "Não é possível excluir contrato com romaneios vinculados." };
    const c = mockContratos.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); c.atualizadoEm = now; c.atualizadoPor = usuarioAtualId(); }
    return { sucesso: true, mensagem: "Contrato excluído com sucesso." };
  },
  async numeroExiste(numero: string, excludeId?: string): Promise<boolean> {
    await delay(100);
    const t = numero.trim().toUpperCase();
    return mockContratos.some((c) => c.deletadoEm === null && c.numeroContrato.toUpperCase() === t && c.id !== excludeId);
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

    // Calculate saldo_a_fixar = entregue - ja_fixado
    const jaFixado = mockContratoFixacoes
      .filter((f) => f.deletadoEm === null && f.contratoId === data.contratoId && f.id !== data.id)
      .reduce((sum, f) => sum + f.quantidadeFixada, 0);

    const saldoDisponivel = calcularSaldoContrato(contrato).entregueNeg - jaFixado;
    const volumeSolicitado = data.quantidadeFixada ?? 0;

    if (volumeSolicitado > saldoDisponivel * 1.05) {
      return { sucesso: false, mensagem: `Volume (${volumeSolicitado}) excede saldo disponível (${saldoDisponivel}). Máx permitido com tolerância 5%: ${(saldoDisponivel * 1.05).toFixed(2)}.` };
    }

    if (volumeSolicitado > saldoDisponivel) {
      console.warn(`[AUDIT] Fixação com over 5%: volume ${volumeSolicitado} > saldo ${saldoDisponivel}. Tolerância agro aplicada.`);
    }

    const existing = data.id ? mockContratoFixacoes.find((f) => f.id === data.id && f.deletadoEm === null) : undefined;
    if (existing) {
      Object.assign(existing, data, {
        grupoId: existing.grupoId, empresaId: existing.empresaId, filialId: existing.filialId,
        criadoEm: existing.criadoEm, criadoPor: existing.criadoPor,
        atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      contasGeradas: false,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoFixacoes.push(fixacao);
    return { sucesso: true, mensagem: "Fixação registrada.", fixacao };
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const f = mockContratoFixacoes.find((f) => f.id === id && f.deletadoEm === null);
    if (f) { f.deletadoEm = now; f.deletadoPor = usuarioAtualId(); f.atualizadoEm = now; f.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: CondicaoDescontoModelo = {
      id: `cdm${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      descricao: (data.descricao ?? "").trim(),
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockCondicaoDescontoModelos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    exigirPermissao("EXCLUIR_CADASTRO_ESTRUTURAL");
    await delay();
    const now = new Date().toISOString();
    const m = mockCondicaoDescontoModelos.find((m) => m.id === id && m.deletadoEm === null);
    if (m) { m.deletadoEm = now; m.deletadoPor = usuarioAtualId(); m.atualizadoEm = now; m.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockCondicaoDescontoModeloItens.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    exigirPermissao("EXCLUIR_CADASTRO_ESTRUTURAL");
    await delay();
    const now = new Date().toISOString();
    const i = mockCondicaoDescontoModeloItens.find((i) => i.id === id && i.deletadoEm === null);
    if (i) { i.deletadoEm = now; i.deletadoPor = usuarioAtualId(); i.atualizadoEm = now; i.atualizadoPor = usuarioAtualId(); }
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
      .forEach((c) => { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); });

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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockContratoCondicoes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockContratoCondicoes.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); c.atualizadoEm = now; c.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: ClassificacaoTipo = {
      id: `ct${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(),
      unidade: data.unidade ?? "PERCENTUAL",
      valorBase: data.valorBase ?? null,
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockClassificacaoTipos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const t = mockClassificacaoTipos.find((t) => t.id === id && t.deletadoEm === null);
    if (t) { t.deletadoEm = now; t.deletadoPor = usuarioAtualId(); t.atualizadoEm = now; t.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockProdutoClassificacoes.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const p = mockProdutoClassificacoes.find((p) => p.id === id && p.deletadoEm === null);
    if (p) { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId(); }
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
      existing.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockClassificacaoDescontos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const d = mockClassificacaoDescontos.find((d) => d.id === id && d.deletadoEm === null);
    if (d) { d.deletadoEm = now; d.deletadoPor = usuarioAtualId(); d.atualizadoEm = now; d.atualizadoPor = usuarioAtualId(); }
  },
  async excluirPorProdutoETipo(produtoId: string, classificacaoTipoId: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    mockClassificacaoDescontos
      .filter((d) => d.deletadoEm === null && d.produtoId === produtoId && d.classificacaoTipoId === classificacaoTipoId)
      .forEach((d) => { d.deletadoEm = now; d.deletadoPor = usuarioAtualId(); d.atualizadoEm = now; d.atualizadoPor = usuarioAtualId(); });
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
      .forEach((r) => { r.deletadoEm = now; r.deletadoPor = usuarioAtualId(); });
    // Insert new
    const novas: RomaneioClassificacao[] = itens.map((item, idx) => ({
      id: `rc${Date.now()}${idx}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      romaneioId,
      classificacaoTipoId: item.classificacaoTipoId,
      valorApurado: item.valorApurado,
      percentualDesconto: item.percentualDesconto,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    return mockFinanceiroContas.filter(
      (c) => c.deletadoEm === null && c.contratoId === contratoId
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
      Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: usuarioAtualId() });
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
      valorTotalReal: data.valorTotalReal ?? data.valorTotal ?? 0,
      status: "ABERTO",
      origem: data.origem ?? "MANUAL",
      documentoReferencia: data.documentoReferencia ?? "",
      contratoId: data.contratoId ?? null,
      dataFaturamento: data.dataFaturamento ?? null,
      dataLiquidacao: data.dataLiquidacao ?? null,
      observacoes: data.observacoes ?? "",
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroContas.push(nova);
    return nova;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockFinanceiroContas.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); c.atualizadoEm = now; c.atualizadoPor = usuarioAtualId(); }
  },
  async atualizarStatus(contaId: string): Promise<void> {
    await delay(100);
    const conta = mockFinanceiroContas.find((c) => c.id === contaId && c.deletadoEm === null);
    if (!conta) return;
    const parcelas = mockFinanceiroParcelas.filter((p) => p.contaId === contaId && p.deletadoEm === null);
    if (parcelas.length === 0) { conta.status = "ABERTO"; return; }
    const todasPagas = parcelas.every((p) => p.status === "PAGO");
    const algumaPaga = parcelas.some((p) => p.status === "PAGO" || p.status === "PARCIAL");
    if (todasPagas) {
      conta.status = "LIQUIDADO";
      conta.dataLiquidacao = new Date().toISOString().slice(0, 10);
    }
    else if (algumaPaga) conta.status = "PARCIAL";
    else conta.status = "ABERTO";
    conta.atualizadoEm = new Date().toISOString();
    conta.atualizadoPor = usuarioAtualId();
  },
  async gerarContasDeContrato(
    contratoId: string,
    parcelasConfig: { numeroParcela: number; dataVencimento: string; valorParcela: number }[],
    ctx: { grupoId: string; empresaId: string; filialId: string },
    provisorio: boolean = false,
    options?: { fixacaoId?: string | null; valorOverride?: number; converterParaBRL?: boolean }
  ): Promise<{ conta: FinanceiroConta; parcelas: FinanceiroParcela[] }> {
    await delay(400);
    const now = new Date().toISOString();
    const contrato = mockContratos.find((c) => c.id === contratoId && c.deletadoEm === null);
    if (!contrato) throw new Error("Contrato não encontrado");
    
    const tipo = contrato.tipoContrato === "COMPRA" ? "PAGAR" : "RECEBER";

    // Conversão para BRL caso moeda do contrato seja diferente da moeda do sistema (BRL = moeda1)
    const moedaContratoId = contrato.moedaId ?? "moeda1";
    const isBRL = moedaContratoId === "moeda1";
    let cotacao = 1;
    if (!isBRL && options?.converterParaBRL !== false) {
      const ult = mockCotacoesMoeda
        .filter((c) => c.deletadoEm === null && c.moedaOrigemId === moedaContratoId && c.moedaDestinoId === "moeda1")
        .sort((a, b) => new Date(b.dataHoraCotacao).getTime() - new Date(a.dataHoraCotacao).getTime())[0];
      cotacao = ult?.valorCompra ?? 1;
    }

    // Aplica conversão nas parcelas (parcelasConfig vem na moeda original)
    const parcelasBRL = parcelasConfig.map((p) => ({
      ...p,
      valorParcela: Math.round(p.valorParcela * cotacao * 100) / 100,
    }));
    const valorTotal = parcelasBRL.reduce((s, p) => s + p.valorParcela, 0);
    const valorOriginal = parcelasConfig.reduce((s, p) => s + p.valorParcela, 0);

    // ============================================================
    // RECONFIGURAÇÃO: se já existe conta vinculada ao contrato (mesma fixação ou sem fixação),
    // reaproveitamos a conta, soft-deletamos parcelas PREVISTO/PENDENTE e preservamos PAGO.
    // Isto evita duplicação de duplicatas ao reconfigurar parcelas.
    // ============================================================
    const fixacaoIdAtual = options?.fixacaoId ?? null;
    const contaExistente = mockFinanceiroContas.find(
      (c) => c.deletadoEm === null && c.contratoId === contratoId && (c.fixacaoId ?? null) === fixacaoIdAtual
    );

    if (contaExistente) {
      const parcelasExistentes = mockFinanceiroParcelas.filter(
        (p) => p.deletadoEm === null && p.contaId === contaExistente.id
      );
      const pagas = parcelasExistentes.filter((p) => p.status === "PAGO" || p.valorPago > 0);
      const editaveis = parcelasExistentes.filter((p) => p.status !== "PAGO" && p.valorPago === 0);

      if (pagas.length > 0) {
        throw new Error(
          "Não é possível reconfigurar: existem parcelas já pagas. Use Liquidação para ajustar diferenças."
        );
      }

      // Determina status a usar nas novas parcelas: preserva o status anterior das editáveis
      // (se todas eram PREVISTO mantém PREVISTO; caso contrário usa PENDENTE)
      const todasEramPrevisto = editaveis.length > 0 && editaveis.every((p) => p.status === "PREVISTO");
      const statusNovo: StatusParcela = todasEramPrevisto ? "PREVISTO" : "PENDENTE";

      // Soft delete das parcelas editáveis antigas
      editaveis.forEach((p) => {
        p.deletadoEm = now;
        p.deletadoPor = usuarioAtualId();
        p.atualizadoEm = now;
        p.atualizadoPor = usuarioAtualId();
      });

      // Atualiza conta existente
      contaExistente.valorTotal = valorTotal;
      contaExistente.valorTotalReal = valorTotal;
      contaExistente.valorOriginalMoeda = valorOriginal;
      contaExistente.cotacaoUsada = cotacao;
      contaExistente.atualizadoEm = now;
      contaExistente.atualizadoPor = usuarioAtualId();

      const totalP2 = parcelasBRL.length;
      const novasParcelas: FinanceiroParcela[] = parcelasBRL.map((input, i) => ({
        id: `fp${Date.now()}${i}`,
        grupoId: ctx.grupoId,
        empresaId: ctx.empresaId,
        filialId: ctx.filialId,
        contaId: contaExistente.id,
        numeroParcela: input.numeroParcela,
        totalParcelas: totalP2,
        dataVencimento: input.dataVencimento,
        valorParcela: input.valorParcela,
        valorReal: input.valorParcela,
        valorPago: 0,
        saldoParcela: input.valorParcela,
        status: statusNovo,
        criadoEm: now,
        criadoPor: usuarioAtualId(),
        atualizadoEm: now,
        atualizadoPor: usuarioAtualId(),
        deletadoEm: null,
        deletadoPor: null,
      }));
      mockFinanceiroParcelas.push(...novasParcelas);

      contrato.duplicatasGeradas = true;
      contrato.atualizadoEm = now;
      contrato.atualizadoPor = usuarioAtualId();

      if (fixacaoIdAtual) {
        const fix = mockContratoFixacoes.find((f) => f.id === fixacaoIdAtual && f.deletadoEm === null);
        if (fix) { fix.contasGeradas = true; fix.atualizadoEm = now; fix.atualizadoPor = usuarioAtualId(); }
      }

      return { conta: contaExistente, parcelas: novasParcelas };
    }

    const conta: FinanceiroConta = {
      id: `fc${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      tipo: tipo as TipoConta,
      pessoaId: contrato.pessoaId,
      descricao: `${tipo === "PAGAR" ? "Compra" : "Venda"} — Contrato ${contrato.numeroContrato}${options?.fixacaoId ? ` (Fixação)` : ""}`,
      dataEmissao: now.slice(0, 10),
      valorTotal,
      valorTotalReal: valorTotal,
      status: "ABERTO",
      origem: options?.fixacaoId ? "FIXACAO" : "CONTRATO",
      documentoReferencia: contrato.numeroContrato,
      contratoId: contrato.id,
      fixacaoId: options?.fixacaoId ?? null,
      moedaOrigemId: moedaContratoId,
      cotacaoUsada: cotacao,
      valorOriginalMoeda: valorOriginal,
      dataFaturamento: now.slice(0, 10),
      dataLiquidacao: null,
      observacoes: "",
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroContas.push(conta);
    
    const totalP = parcelasBRL.length;
    const novasParcelas: FinanceiroParcela[] = parcelasBRL.map((input, i) => ({
      id: `fp${Date.now()}${i}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contaId: conta.id,
      numeroParcela: input.numeroParcela,
      totalParcelas: totalP,
      dataVencimento: input.dataVencimento,
      valorParcela: input.valorParcela,
      valorReal: input.valorParcela,
      valorPago: 0,
      saldoParcela: input.valorParcela,
      status: (provisorio ? "PREVISTO" : "PENDENTE") as StatusParcela,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    }));
    mockFinanceiroParcelas.push(...novasParcelas);
    
    // Mark duplicatas as generated.
    // NÃO altera status do contrato — faturamento/liquidação são tratados
    // exclusivamente pela aba Liquidação. Manipulações na aba Financeiro
    // (gerar/reconfigurar parcelas) não devem mudar o status do contrato.
    contrato.duplicatasGeradas = true;
    contrato.atualizadoEm = now;
    contrato.atualizadoPor = usuarioAtualId();

    if (options?.fixacaoId) {
      const fix = mockContratoFixacoes.find((f) => f.id === options.fixacaoId && f.deletadoEm === null);
      if (fix) { fix.contasGeradas = true; fix.atualizadoEm = now; fix.atualizadoPor = usuarioAtualId(); }
    }

    return { conta, parcelas: novasParcelas };
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
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); });
    const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
    const novas: FinanceiroParcela[] = [];
    for (let i = 0; i < numParcelas; i++) {
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + intervaloDias * (i + 1));
      const val = i === numParcelas - 1 ? valorTotal - valorParcela * (numParcelas - 1) : valorParcela;
      const parcela: FinanceiroParcela = {
        id: `fp${Date.now()}${i}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        contaId, numeroParcela: i + 1, totalParcelas: numParcelas,
        dataVencimento: vencimento.toISOString().slice(0, 10),
        valorParcela: val, valorReal: val, valorPago: 0, saldoParcela: val, status: "PENDENTE",
        criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); });
    const novas: FinanceiroParcela[] = [];
    for (const input of parcelasInput) {
      const parcela: FinanceiroParcela = {
        id: `fp${Date.now()}${input.numeroParcela}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        contaId, numeroParcela: input.numeroParcela, totalParcelas: parcelasInput.length,
        dataVencimento: input.dataVencimento,
        valorParcela: input.valorParcela, valorReal: input.valorParcela, valorPago: 0, saldoParcela: input.valorParcela, status: "PENDENTE",
        criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      .forEach((p) => { p.deletadoEm = now; p.deletadoPor = usuarioAtualId(); });
  },
  async atualizarVencimento(parcelaId: string, novaData: string): Promise<FinanceiroParcela> {
    await delay();
    const p = mockFinanceiroParcelas.find((x) => x.id === parcelaId && x.deletadoEm === null);
    if (!p) throw new Error("Parcela não encontrada");
    if (p.status === "PAGO" || p.status === "CANCELADA") {
      throw new Error("Parcela liquidada/cancelada não permite alteração de vencimento");
    }
    p.dataVencimento = novaData;
    p.atualizadoEm = new Date().toISOString();
    p.atualizadoPor = usuarioAtualId();
    return p;
  },
  async listarTodas(empresaId: string, filialId: string): Promise<(FinanceiroParcela & { conta?: FinanceiroConta })[]> {
    await delay();
    const hoje = new Date().toISOString().slice(0, 10);
    return mockFinanceiroParcelas
      .filter((p) => p.deletadoEm === null && p.empresaId === empresaId && p.filialId === filialId)
      .map((p) => {
        const conta = mockFinanceiroContas.find((c) => c.id === p.contaId && c.deletadoEm === null);
        // Auto-mark VENCIDA
        const status: StatusParcela = (p.status === "PENDENTE" && p.dataVencimento < hoje) ? "VENCIDA" : p.status;
        return { ...p, status, conta };
      })
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
  },
  async listarPrevisoesFluxo(grupoId: string): Promise<{ mes: string; previsoes: number; aPagar: number; pago: number }[]> {
    await delay();
    const hoje = new Date().toISOString().slice(0, 10);
    const parcelas = mockFinanceiroParcelas.filter((p) => p.deletadoEm === null && p.grupoId === grupoId);
    const meses: Record<string, { previsoes: number; aPagar: number; pago: number }> = {};
    for (const p of parcelas) {
      const mes = p.dataVencimento.slice(0, 7); // YYYY-MM
      if (!meses[mes]) meses[mes] = { previsoes: 0, aPagar: 0, pago: 0 };
      if (p.status === "PAGO") {
        meses[mes].pago += p.valorReal;
      } else if ((p.status === "PENDENTE" || p.status === "PREVISTO") && p.dataVencimento >= hoje) {
        meses[mes].previsoes += p.saldoParcela;
      } else {
        // VENCIDA, PARCIAL or overdue PENDENTE
        meses[mes].aPagar += p.saldoParcela;
      }
    }
    return Object.entries(meses)
      .map(([mes, v]) => ({ mes, ...v }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  },
};

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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
      parcela.atualizadoPor = usuarioAtualId();
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
      existing.limiteCreditoBancario = data.limiteCreditoBancario ?? existing.limiteCreditoBancario;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.bancoId = data.bancoId !== undefined ? data.bancoId : existing.bancoId;
      existing.agencia = data.agencia ?? existing.agencia;
      existing.contaCorrente = data.contaCorrente ?? existing.contaCorrente;
      existing.atualizadoEm = now;
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: FinanceiroContaFinanceira = {
      id: `fcf${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      descricao: (data.descricao ?? "").trim(),
      tipoContaId: data.tipoContaId ?? "",
      saldoAtual: data.saldoAtual ?? 0,
      permiteSaldoNegativo: data.permiteSaldoNegativo ?? false,
      limiteCreditoBancario: data.limiteCreditoBancario ?? 0,
      ativo: data.ativo ?? true,
      bancoId: data.bancoId ?? null,
      agencia: data.agencia ?? "",
      contaCorrente: data.contaCorrente ?? "",
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroContasFinanceiras.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const now = new Date().toISOString();
    const c = mockFinanceiroContasFinanceiras.find((c) => c.id === id && c.deletadoEm === null);
    if (c) { c.deletadoEm = now; c.deletadoPor = usuarioAtualId(); c.atualizadoEm = now; c.atualizadoPor = usuarioAtualId(); }
  },
  atualizarSaldo(id: string, delta: number): void {
    const c = mockFinanceiroContasFinanceiras.find((c) => c.id === id && c.deletadoEm === null);
    if (c) {
      c.saldoAtual += delta;
      c.atualizadoEm = new Date().toISOString();
      c.atualizadoPor = usuarioAtualId();
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
      existing.categoria = data.categoria ?? existing.categoria;
      existing.exigeCentroCusto = data.exigeCentroCusto ?? existing.exigeCentroCusto;
      existing.exigePlanoContas = data.exigePlanoContas ?? existing.exigePlanoContas;
      existing.apareceNaPesquisa = data.apareceNaPesquisa ?? existing.apareceNaPesquisa;
      existing.ativo = data.ativo ?? existing.ativo;
      existing.contaContabilId = existing.exigePlanoContas ? (data.contaContabilId ?? null) : null;
      existing.contaContabilNome = existing.exigePlanoContas ? (data.contaContabilNome ?? null) : null;
      existing.atualizadoEm = now;
      existing.atualizadoPor = usuarioAtualId();
      return existing;
    }
    const novo: FinanceiroTipoLancamento = {
      id: `ftl${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: null, filialId: null,
      descricao: (data.descricao ?? "").trim(),
      tipoMovimento: data.tipoMovimento ?? "ENTRADA",
      tipoConta: data.tipoConta ?? [],
      categoria: data.categoria ?? "GERAL",
      origemSistema: false,
      permiteEdicao: true,
      permiteExclusao: true,
      exigeCentroCusto: data.exigeCentroCusto ?? false,
      exigePlanoContas: data.exigePlanoContas ?? false,
      apareceNaPesquisa: data.apareceNaPesquisa ?? true,
      ativo: data.ativo ?? true,
      contaContabilId: (data.exigePlanoContas ?? false) ? (data.contaContabilId ?? null) : null,
      contaContabilNome: (data.exigePlanoContas ?? false) ? (data.contaContabilNome ?? null) : null,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    t.deletadoEm = now; t.deletadoPor = usuarioAtualId(); t.atualizadoEm = now; t.atualizadoPor = usuarioAtualId();
    return { sucesso: true, mensagem: "Excluído com sucesso." };
  },
};

// ============================================================
// Financeiro — Formas de Pagamento
// ============================================================
export const financeiroFormaPagtoService = createCorporateCrudService<FinanceiroFormaPagto>(mockFinanceiroFormasPagto as any, "ffp");

// ============================================================
// Financeiro — Cheques (cofre / disponíveis para pagamento)
// ============================================================
export const financeiroChequeService = {
  ...createCorporateCrudService<FinanceiroCheque>(mockFinanceiroCheques as any, "chq"),
  async listarDisponiveis(empresaId: string, filialId: string): Promise<FinanceiroCheque[]> {
    await delay();
    return mockFinanceiroCheques.filter(
      (c) => c.deletadoEm === null && c.ativo && c.status === "DISPONIVEL"
    );
  },
};

// ============================================================
// Financeiro — Cartões (disponíveis para pagamento)
// ============================================================
export const financeiroCartaoService = {
  ...createCorporateCrudService<FinanceiroCartao>(mockFinanceiroCartoes as any, "crt"),
  async listarDisponiveis(empresaId: string, filialId: string): Promise<FinanceiroCartao[]> {
    await delay();
    return mockFinanceiroCartoes.filter(
      (c) => c.deletadoEm === null && c.ativo && c.status === "DISPONIVEL"
    );
  },
};

// ============================================================
// Financeiro — Plano de Contas (banco real, Fase 2.2)
// ============================================================
function criarCrudCorporativoDb<T extends CorporateEntity>(
  tabela: string,
  mapear: (r: any) => T,
  paraLinha: (d: Partial<T>) => Record<string, unknown>
) {
  const listarTudo = async () => (await dbListar(tabela, "descricao")).map(mapear);
  return {
    async listar(_empresaId: string, _filialId: string): Promise<T[]> { return listarTudo(); },
    async listarPorGrupo(_grupoId: string): Promise<T[]> { return listarTudo(); },
    async listarTodos(): Promise<T[]> { return listarTudo(); },
    async descricaoExiste(descricao: string, _e: string, _f: string, excludeId?: string): Promise<boolean> {
      const alvo = descricao.trim().toLowerCase();
      return (await listarTudo()).some((i) => i.descricao.toLowerCase() === alvo && i.id !== excludeId);
    },
    async salvar(data: Partial<T>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<T> {
      const linha = { descricao: (data.descricao ?? "").trim(), ativo: data.ativo ?? true, ...paraLinha(data) };
      if (data.id) return mapear(await dbAtualizar(tabela, data.id, linha));
      return mapear(await dbInserir(tabela, { ...linha, grupo_id: ctx.grupoId || grupoDaSessao() }));
    },
    async excluir(id: string): Promise<void> {
      // Cadastro estrutural: exclusão restrita ao Administrador (serviço + RLS).
      exigirPermissao("EXCLUIR_CADASTRO_ESTRUTURAL");
      await dbExcluirLogico(tabela, id);
    },
  };
}

export const financeiroPlanoContaService = criarCrudCorporativoDb<FinanceiroPlanoConta>(
  "plano_contas",
  (r) => ({
    id: r.id, grupoId: r.grupo_id, empresaId: null, filialId: null, codigo: r.codigo, descricao: r.descricao,
    tipo: r.tipo as TipoPlanoConta, ativo: r.ativo, ...auditoriaDe(r),
  }),
  (d) => ({ codigo: (d.codigo ?? "").trim(), tipo: d.tipo ?? "DESPESA" })
);

// ============================================================
// Financeiro — Centros de Custo (banco real, Fase 2.2)
// ============================================================
export const financeiroCentroCustoService = criarCrudCorporativoDb<FinanceiroCentroCusto>(
  "centros_custo",
  (r) => ({
    id: r.id, grupoId: r.grupo_id, empresaId: null, filialId: null, descricao: r.descricao, ativo: r.ativo, ...auditoriaDe(r),
  }),
  () => ({})
);

// ============================================================
// Financeiro — Movimentações
// ============================================================
function validarSaldoBackend(conta: FinanceiroContaFinanceira, valor: number): string | null {
  if (!valor || valor <= 0) return null;
  const tipo = mockFinanceiroTipoContas.find((t) => t.id === conta.tipoContaId)?.descricao?.toUpperCase();
  const saldoResultante = +(conta.saldoAtual - valor).toFixed(2);
  if (tipo === "BANCO") {
    const limite = conta.limiteCreditoBancario ?? 0;
    if (saldoResultante >= -limite) return null;
    return limite > 0
      ? `Limite de crédito de R$ ${limite.toFixed(2)} ultrapassado. Operação não permitida.`
      : `Saldo insuficiente em "${conta.descricao}". Operação não permitida.`;
  }
  // CAIXA, CARTEIRA ou desconhecido
  if (saldoResultante < 0) {
    return `Saldo insuficiente em "${conta.descricao}". Operação não permitida.`;
  }
  return null;
}

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
      formasPagamentoDetalhe?: { dinheiro: number; cheque: number; cartao: number; adiantamento: number } | null;
      composicaoDinheiro?: Array<{ formaId: string; valor: number }> | null;
      composicaoCheque?: Array<{ chequeId?: string | null; numero?: string | null; banco?: string | null; valor: number }> | null;
      composicaoCartao?: Array<{ cartaoId?: string | null; numero?: string | null; bandeira?: string | null; valor: number }> | null;
      composicaoAdiantamento?: Array<{ adiantamentoId: string; valor: number }> | null;
      solicitacaoAdiantamentoId?: string | null;
    },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: FinanceiroMovimentacao; adiantamento?: FinanceiroAdiantamento }> {
    await delay(400);
    const now = new Date().toISOString();

    const tipoLanc = mockFinanceiroTiposLancamento.find((t) => t.id === data.tipoLancamentoId && t.deletadoEm === null);
    if (!tipoLanc) return { sucesso: false, mensagem: "Tipo de lançamento não encontrado." };

    const tipoMovimento = tipoLanc.tipoMovimento;

    if (tipoMovimento === "TRANSFERENCIA") {
      if (!data.contaOrigemId || !data.contaDestinoId) return { sucesso: false, mensagem: "Informe conta origem e destino." };
      const contaOrigem = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaOrigemId && c.deletadoEm === null);
      const contaDestino = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaDestinoId && c.deletadoEm === null);
      if (!contaOrigem || !contaDestino) return { sucesso: false, mensagem: "Conta origem ou destino não encontrada." };
      const blq = validarSaldoBackend(contaOrigem, data.valor);
      if (blq) return { sucesso: false, mensagem: blq };
      contaOrigem.saldoAtual -= data.valor;
      contaDestino.saldoAtual += data.valor;
    } else {
      const contaFin = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaFinanceiraId && c.deletadoEm === null);
      if (!contaFin) return { sucesso: false, mensagem: "Conta financeira não encontrada." };
      if (tipoMovimento === "ENTRADA") {
        contaFin.saldoAtual += data.valor;
      } else {
        const blq = validarSaldoBackend(contaFin, data.valor);
        if (blq) return { sucesso: false, mensagem: blq };
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
      formasPagamentoDetalhe: data.formasPagamentoDetalhe ?? null,
      composicaoDinheiro: data.composicaoDinheiro && data.composicaoDinheiro.length > 0 ? data.composicaoDinheiro.map((c) => ({ ...c })) : null,
      composicaoCheque: data.composicaoCheque && data.composicaoCheque.length > 0 ? data.composicaoCheque.map((c) => ({ ...c })) : null,
      composicaoCartao: data.composicaoCartao && data.composicaoCartao.length > 0 ? data.composicaoCartao.map((c) => ({ ...c })) : null,
      composicaoAdiantamento: data.composicaoAdiantamento && data.composicaoAdiantamento.length > 0 ? data.composicaoAdiantamento.map((c) => ({ ...c })) : null,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroMovimentacoes.push(mov);

    if (data.parcelaId) {
      const parcela = mockFinanceiroParcelas.find((p) => p.id === data.parcelaId && p.deletadoEm === null);
      if (parcela) {
        if (parcela.status === "PREVISTO") {
          return { sucesso: false, mensagem: "Duplicata em status de previsão não pode ser baixada. Aguarde a efetivação do contrato." };
        }
        if (parcela.status === "CANCELADA") {
          return { sucesso: false, mensagem: "Parcela cancelada não pode receber baixa." };
        }
        parcela.valorPago += data.valor;
        parcela.saldoParcela = parcela.valorParcela - parcela.valorPago;
        if (parcela.saldoParcela <= 0) { parcela.saldoParcela = 0; parcela.status = "PAGO"; }
        else { parcela.status = "PARCIAL"; }
        parcela.atualizadoEm = now; parcela.atualizadoPor = usuarioAtualId();
        await financeiroContaService.atualizarStatus(parcela.contaId);
      }
    }

    // Gera saldo de Adiantamento (Cliente ou Fornecedor) atomicamente com o lançamento.
    let adiantamentoCriado: FinanceiroAdiantamento | undefined;
    if (
      (tipoLanc.categoria === "ADIANT_FORNECEDOR" || tipoLanc.categoria === "ADIANT_CLIENTE")
      && data.pessoaId
    ) {
      const tipoBenef: TipoBeneficiarioAdiantamento =
        tipoLanc.categoria === "ADIANT_FORNECEDOR" ? "FORNECEDOR" : "CLIENTE";
      const origem: "SOLICITACAO_FORNECEDOR" | "CAIXA_CLIENTE" =
        tipoBenef === "FORNECEDOR" ? "SOLICITACAO_FORNECEDOR" : "CAIXA_CLIENTE";

      adiantamentoCriado = {
        id: `fad${Date.now()}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        pessoaId: data.pessoaId,
        tipoBeneficiario: tipoBenef,
        contratoId: null,
        movimentacaoFinanceiraId: mov.id,
        dataAdiantamento: data.dataMovimento,
        valorAdiantamento: data.valor,
        saldoUtilizado: 0,
        saldoRestante: data.valor,
        status: "ABERTO",
        origemTipo: origem,
        solicitacaoId: data.solicitacaoAdiantamentoId ?? null,
        observacao: data.historico || null,
        criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
        deletadoEm: null, deletadoPor: null,
      };
      mockFinanceiroAdiantamentos.push(adiantamentoCriado);

      if (data.solicitacaoAdiantamentoId) {
        const sol = mockAdiantamentoSolicitacoes.find(
          (s) => s.id === data.solicitacaoAdiantamentoId && s.deletadoEm === null
        );
        if (sol) {
          sol.status = "LIBERADO";
          sol.movimentacaoFinanceiraId = mov.id;
          sol.adiantamentoId = adiantamentoCriado.id;
          sol.atualizadoEm = now;
          sol.atualizadoPor = usuarioAtualId();
        }
      }
    }

    return {
      sucesso: true,
      mensagem: "Movimentação registrada com sucesso.",
      movimentacao: mov,
      adiantamento: adiantamentoCriado,
    };
  },

  /**
   * Baixa multi-parcela (REC_DUPLICATA / PAG_DUPLICATA).
   * Distribuição sequencial: ordena parcelas selecionadas por dataVencimento ASC, id ASC,
   * liquida totalmente as mais antigas e deixa parcial na última que sobrar.
   * Cria 1 FinanceiroMovimentacao com arrays de rastreabilidade.
   */
  async registrarBaixaDuplicatas(
    data: {
      contaFinanceiraId: string;
      tipoLancamentoId: string;
      formaPagamentoId: string;
      centroCustoId?: string | null;
      dataMovimento: string;
      pessoaId: string;
      parcelaIds: string[];
      valorTotal: number;
      numeroDocumento: string;
      historico: string;
      formasPagamentoDetalhe: { dinheiro: number; cheque: number; cartao: number; adiantamento: number };
      composicaoDinheiro?: Array<{ formaId: string; valor: number }> | null;
      composicaoCheque?: Array<{ chequeId?: string | null; numero?: string | null; banco?: string | null; valor: number }> | null;
      composicaoCartao?: Array<{ cartaoId?: string | null; numero?: string | null; bandeira?: string | null; valor: number }> | null;
      adiantamentosUsados: Array<{ adiantamentoId: string; valor: number }>;
    },
    ctx: { grupoId: string; empresaId: string; filialId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; movimentacao?: FinanceiroMovimentacao; parcelasLiquidadas?: number }> {
    await delay(400);
    const now = new Date().toISOString();

    const tipoLanc = mockFinanceiroTiposLancamento.find((t) => t.id === data.tipoLancamentoId && t.deletadoEm === null);
    if (!tipoLanc) return { sucesso: false, mensagem: "Tipo de lançamento não encontrado." };
    if (tipoLanc.categoria !== "REC_DUPLICATA" && tipoLanc.categoria !== "PAG_DUPLICATA") {
      return { sucesso: false, mensagem: "Categoria inválida para baixa de duplicatas." };
    }
    if (data.parcelaIds.length === 0) return { sucesso: false, mensagem: "Selecione ao menos uma duplicata." };

    // Carrega e valida parcelas
    const parcelas = data.parcelaIds
      .map((id) => mockFinanceiroParcelas.find((p) => p.id === id && p.deletadoEm === null))
      .filter((p): p is FinanceiroParcela => !!p);
    if (parcelas.length !== data.parcelaIds.length) {
      return { sucesso: false, mensagem: "Uma ou mais duplicatas não foram encontradas." };
    }
    for (const p of parcelas) {
      if (p.status === "PAGO" || p.status === "CANCELADA" || p.status === "PREVISTO") {
        return { sucesso: false, mensagem: `Parcela ${p.id} não pode ser baixada (status ${p.status}).` };
      }
    }
    const somaSaldos = parcelas.reduce((s, p) => s + p.saldoParcela, 0);
    if (data.valorTotal > somaSaldos + 0.0001) {
      return { sucesso: false, mensagem: "Valor informado excede a soma dos saldos das duplicatas selecionadas." };
    }

    // Valida e debita adiantamentos
    const adts = data.adiantamentosUsados.map((a) => ({
      a,
      entity: mockFinanceiroAdiantamentos.find((x) => x.id === a.adiantamentoId && x.deletadoEm === null),
    }));
    for (const { a, entity } of adts) {
      if (!entity) return { sucesso: false, mensagem: `Adiantamento ${a.adiantamentoId} não encontrado.` };
      if (entity.saldoRestante + 0.0001 < a.valor) {
        return { sucesso: false, mensagem: `Adiantamento sem saldo suficiente (${entity.saldoRestante.toFixed(2)}).` };
      }
    }

    // Atualiza saldo da conta financeira (1x pelo total)
    const contaFin = mockFinanceiroContasFinanceiras.find((c) => c.id === data.contaFinanceiraId && c.deletadoEm === null);
    if (!contaFin) return { sucesso: false, mensagem: "Conta financeira não encontrada." };
    if (tipoLanc.tipoMovimento === "ENTRADA") {
      contaFin.saldoAtual += data.valorTotal;
    } else {
      const blq = validarSaldoBackend(contaFin, data.valorTotal);
      if (blq) return { sucesso: false, mensagem: blq };
      contaFin.saldoAtual -= data.valorTotal;
    }

    // Distribuição sequencial por vencimento
    const ordenadas = [...parcelas].sort((x, y) => {
      const cmp = x.dataVencimento.localeCompare(y.dataVencimento);
      return cmp !== 0 ? cmp : x.id.localeCompare(y.id);
    });
    const parcelasLiquidadas: NonNullable<FinanceiroMovimentacao["parcelasLiquidadas"]> = [];
    let restante = data.valorTotal;
    for (const p of ordenadas) {
      if (restante <= 0.0001) break;
      const aplicar = Math.min(p.saldoParcela, restante);
      const statusAntes = p.status;
      p.valorPago += aplicar;
      p.saldoParcela = +(p.valorParcela - p.valorPago).toFixed(2);
      if (p.saldoParcela <= 0.0001) { p.saldoParcela = 0; p.status = "PAGO"; }
      else { p.status = "PARCIAL"; }
      p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId();
      parcelasLiquidadas.push({
        parcelaId: p.id,
        valorLiquidado: +aplicar.toFixed(2),
        statusAntes,
        statusDepois: p.status,
      });
      restante = +(restante - aplicar).toFixed(2);
      await financeiroContaService.atualizarStatus(p.contaId);
    }

    // Debita adiantamentos
    for (const { a, entity } of adts) {
      if (!entity || a.valor <= 0) continue;
      entity.saldoUtilizado += a.valor;
      entity.saldoRestante = +(entity.valorAdiantamento - entity.saldoUtilizado).toFixed(2);
      if (entity.saldoRestante <= 0.0001) { entity.saldoRestante = 0; entity.status = "LIQUIDADO"; }
      else { entity.status = "PARCIAL"; }
      entity.atualizadoEm = now; entity.atualizadoPor = usuarioAtualId();
    }

    const mov: FinanceiroMovimentacao = {
      id: `fmov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      contaFinanceiraId: data.contaFinanceiraId,
      tipoLancamentoId: data.tipoLancamentoId,
      tipoMovimento: tipoLanc.tipoMovimento,
      formaPagamentoId: data.formaPagamentoId,
      planoContaId: null,
      centroCustoId: data.centroCustoId ?? null,
      dataMovimento: data.dataMovimento,
      valor: data.valorTotal,
      numeroDocumento: data.numeroDocumento,
      historico: data.historico,
      contaOrigemId: null,
      contaDestinoId: null,
      parcelaId: null,
      pessoaId: data.pessoaId,
      formasPagamentoDetalhe: { ...data.formasPagamentoDetalhe },
      composicaoDinheiro: data.composicaoDinheiro && data.composicaoDinheiro.length > 0 ? data.composicaoDinheiro.map((c) => ({ ...c })) : null,
      composicaoCheque: data.composicaoCheque && data.composicaoCheque.length > 0 ? data.composicaoCheque.map((c) => ({ ...c })) : null,
      composicaoCartao: data.composicaoCartao && data.composicaoCartao.length > 0 ? data.composicaoCartao.map((c) => ({ ...c })) : null,
      composicaoAdiantamento: data.adiantamentosUsados && data.adiantamentosUsados.filter((a) => a.valor > 0).length > 0 ? data.adiantamentosUsados.filter((a) => a.valor > 0).map((a) => ({ ...a })) : null,
      parcelasLiquidadas,
      adiantamentosUsados: data.adiantamentosUsados.filter((a) => a.valor > 0),
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockFinanceiroMovimentacoes.push(mov);

    return {
      sucesso: true,
      mensagem: "Baixa registrada com sucesso.",
      movimentacao: mov,
      parcelasLiquidadas: parcelasLiquidadas.length,
    };
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
// Adiantamento — Solicitações (somente Fornecedor)
// ============================================================
export const adiantamentoSolicitacaoService = {
  async listar(empresaId: string, filialId: string): Promise<AdiantamentoSolicitacao[]> {
    await delay();
    return mockAdiantamentoSolicitacoes
      .filter((s) => s.deletadoEm === null && s.empresaId === empresaId && s.filialId === filialId)
      .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
  },
  async listarAprovadosPorPessoa(pessoaId: string): Promise<AdiantamentoSolicitacao[]> {
    await delay(100);
    return mockAdiantamentoSolicitacoes.filter(
      (s) => s.deletadoEm === null && s.pessoaId === pessoaId && s.status === "APROVADO"
    );
  },
  async criar(
    data: { pessoaId: string; valor: number; observacoes: string },
    ctx: { grupoId: string; empresaId: string; filialId: string; usuarioId: string }
  ): Promise<{ sucesso: boolean; mensagem: string; solicitacao?: AdiantamentoSolicitacao }> {
    await delay(200);
    if (!data.pessoaId) return { sucesso: false, mensagem: "Informe o fornecedor." };
    if (!data.valor || data.valor <= 0) return { sucesso: false, mensagem: "Valor deve ser maior que zero." };
    const now = new Date().toISOString();
    const sol: AdiantamentoSolicitacao = {
      id: `sol${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      pessoaId: data.pessoaId,
      valor: data.valor,
      status: "SOLICITADO",
      dataSolicitacao: now.slice(0, 10),
      dataAprovacao: null,
      observacoes: data.observacoes ?? "",
      usuarioCriacaoId: ctx.usuarioId,
      usuarioAprovacaoId: null,
      movimentacaoFinanceiraId: null,
      adiantamentoId: null,
      criadoEm: now, criadoPor: ctx.usuarioId,
      atualizadoEm: now, atualizadoPor: ctx.usuarioId,
      deletadoEm: null, deletadoPor: null,
    };
    mockAdiantamentoSolicitacoes.push(sol);
    return { sucesso: true, mensagem: "Solicitação criada.", solicitacao: sol };
  },
  async _transicao(
    id: string,
    permitidos: StatusSolicitacaoAdiantamento[],
    novoStatus: StatusSolicitacaoAdiantamento,
    usuarioId: string,
    setAprovacao = false
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay(150);
    const sol = mockAdiantamentoSolicitacoes.find((s) => s.id === id && s.deletadoEm === null);
    if (!sol) return { sucesso: false, mensagem: "Solicitação não encontrada." };
    if (!permitidos.includes(sol.status)) {
      return { sucesso: false, mensagem: `Solicitação com status ${sol.status} não permite essa ação.` };
    }
    const now = new Date().toISOString();
    sol.status = novoStatus;
    sol.atualizadoEm = now;
    sol.atualizadoPor = usuarioId;
    if (setAprovacao) {
      sol.dataAprovacao = now.slice(0, 10);
      sol.usuarioAprovacaoId = usuarioId;
    }
    return { sucesso: true, mensagem: "OK" };
  },
  aprovar(id: string, usuarioId = usuarioAtualId()) {
    return this._transicao(id, ["SOLICITADO"], "APROVADO", usuarioId, true);
  },
  rejeitar(id: string, usuarioId = usuarioAtualId()) {
    return this._transicao(id, ["SOLICITADO"], "REJEITADO", usuarioId);
  },
  cancelar(id: string, usuarioId = usuarioAtualId()) {
    return this._transicao(id, ["SOLICITADO", "APROVADO"], "CANCELADO", usuarioId);
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
import type { Motorista, Veiculo, Romaneio, StatusRomaneio, RomaneioPesagem, TipoPesagem, OrigemRomaneio, TipoRomaneio, ContratoLiquidacao, StatusLiquidacao } from "./mock-data";

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
      if (existing) { Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: usuarioAtualId() }); return existing; }
    }
    const novo: Motorista = {
      id: `mot${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      nome: data.nome || "", documento: data.documento || "", telefone: data.telefone || "",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockMotoristas.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const m = mockMotoristas.find((x) => x.id === id);
    if (m) { m.deletadoEm = new Date().toISOString(); m.deletadoPor = usuarioAtualId(); }
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
      if (existing) { Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: usuarioAtualId() }); return existing; }
    }
    const novo: Veiculo = {
      id: `veic${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: null,
      placa: data.placa || "", tipoVeiculo: data.tipoVeiculo || "", transportadora: data.transportadora || "",
      ativo: data.ativo ?? true,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockVeiculos.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const v = mockVeiculos.find((x) => x.id === id);
    if (v) { v.deletadoEm = new Date().toISOString(); v.deletadoPor = usuarioAtualId(); }
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
  async verificarDuplicado(criterio: {
    empresaId: string;
    filialId: string;
    origem: OrigemRomaneio;
    tipoRomaneio: TipoRomaneio;
    produtoId: string;
    pontoEstoqueId: string | null;
    motoristaId: string | null;
    veiculoId: string | null;
    data?: Date;
    excludeId?: string;
  }): Promise<boolean> {
    await delay(50);
    const day = (criterio.data ?? new Date()).toISOString().slice(0, 10);
    return mockRomaneios.some((r) =>
      r.deletadoEm === null &&
      r.id !== criterio.excludeId &&
      r.empresaId === criterio.empresaId &&
      r.filialId === criterio.filialId &&
      r.origem === criterio.origem &&
      r.tipoRomaneio === criterio.tipoRomaneio &&
      r.produtoId === criterio.produtoId &&
      (r.pontoEstoqueId ?? null) === (criterio.pontoEstoqueId ?? null) &&
      (r.motoristaId ?? null) === (criterio.motoristaId ?? null) &&
      (r.veiculoId ?? null) === (criterio.veiculoId ?? null) &&
      r.criadoEm.slice(0, 10) === day
    );
  },
  async salvar(data: Partial<Romaneio>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<Romaneio> {
    await delay();
    data = normalizarPesosRomaneio(data);
    const now = new Date().toISOString();
    if (data.id) {
      const existing = mockRomaneios.find((r) => r.id === data.id);
      if (existing) {
        Object.assign(existing, data, { atualizadoEm: now, atualizadoPor: usuarioAtualId() });
        return existing;
      }
    }
    const produto = mockProdutos.find((p) => p.id === data.produtoId);
    const unidadeRomaneioId = data.unidadeRomaneioId || (produto ? getUnidadeBaseParaTipo(produto.tipoUnidade) : "um1");
    const origem = data.origem || "AVULSO";
    const tipoRomaneio = data.tipoRomaneio || "ENTRADA";

    const novo: Romaneio = {
      id: `rom${Date.now()}`, grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      origem,
      tipoRomaneio,
      contratoId: data.contratoId || null,
      safraId: data.safraId || null,
      cultivoId: data.cultivoId || null,
      pessoaId: data.pessoaId || null,
      produtoId: data.produtoId || "",
      motoristaId: data.motoristaId || null,
      motoristaNome: data.motoristaNome || "",
      motoristaDocumento: data.motoristaDocumento || "",
      veiculoId: data.veiculoId || null,
      placaVeiculo: data.placaVeiculo || "",
      pontoEstoqueId: data.pontoEstoqueId || null,
      unidadeRomaneioId,
      status: data.status || "RASCUNHO",
      pesoEntrada: 0, pesoSaida: 0, pesoCarregado: 0, pesoTara: 0, pesoLiquidoFisico: 0,
      pesoClassificado: 0, totalPercentualDescontos: 0, totalPesoDescontado: 0, dataClassificacao: null,
      pesoBruto: 0, pesoLiquido: 0, pesoTaraLegacy: 0,
      classificacaoUmidade: 0, classificacaoImpureza: 0, classificacaoArdidos: 0, classificacaoAvariados: 0,
      pesoLiquidoSecoLimpo: 0,
      observacao: data.observacao || "",
      origemCriacao: data.origemCriacao || "TELA_ROMANEIOS",
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockRomaneios.push(novo);
    return novo;
  },
  async excluir(id: string): Promise<void> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === id);
    if (r) { r.deletadoEm = new Date().toISOString(); r.deletadoPor = usuarioAtualId(); }
    if (r?.contratoId) { const c = mockContratos.find((x) => x.id === r.contratoId); if (c) atualizarCacheSaldoContrato(c); }
  },
  /**
   * CANCELAMENTO — só para romaneio que ainda NÃO virou fato físico.
   * Romaneio FINALIZADO / CANCELADO / ESTORNADO é recusado AQUI, na camada de
   * serviço (não basta esconder o botão). Para desfazer um finalizado existe
   * o ESTORNO, que reverte estoque e saldo na mesma operação.
   */
  async cancelar(id: string): Promise<void> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === id && x.deletadoEm === null);
    if (!r) throw new Error("Romaneio não encontrado.");
    if (r.status === "FINALIZADO") {
      throw new Error("Romaneio finalizado não pode ser cancelado. Use o Estorno, que reverte estoque e saldo do contrato com autorização e justificativa.");
    }
    if (r.status === "CANCELADO" || r.status === "ESTORNADO") {
      throw new Error(`Romaneio já está ${r.status === "CANCELADO" ? "cancelado" : "estornado"}.`);
    }
    r.status = "CANCELADO";
    r.atualizadoEm = new Date().toISOString();
    r.atualizadoPor = usuarioAtualId();
    if (r.contratoId) { const c = mockContratos.find((x) => x.id === r.contratoId); if (c) atualizarCacheSaldoContrato(c); }
  },

  /**
   * ESTORNO — único mecanismo de correção de romaneio FINALIZADO.
   * Histórico físico nunca é apagado nem reescrito: o romaneio permanece
   * visível com status ESTORNADO, justificativa, autor e data.
   *
   * Recusado quando houver dependência: fixação de preço vinculada ao
   * contrato ou liquidação referenciando o contrato. O caminho é reverter a
   * fixação/liquidação primeiro e só então estornar.
   *
   * Reverte em UMA única operação lógica: movimento de estoque + saldo do
   * contrato (cache) + status do romaneio.
   */
  async estornar(
    id: string,
    justificativa: string,
    tokenAutorizacao?: string
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    try {
      consumirAutorizacao(tokenAutorizacao, "ESTORNO_ROMANEIO", id);
    } catch (e: any) {
      return { sucesso: false, mensagem: e.message };
    }
    const r = mockRomaneios.find((x) => x.id === id && x.deletadoEm === null);
    if (!r) return { sucesso: false, mensagem: "Romaneio não encontrado." };
    if (r.status !== "FINALIZADO") {
      return { sucesso: false, mensagem: "Somente romaneios FINALIZADOS podem ser estornados." };
    }
    const texto = (justificativa ?? "").trim();
    if (texto.length < MIN_CARACTERES_JUSTIFICATIVA_ESTORNO) {
      return { sucesso: false, mensagem: `Justificativa obrigatória com no mínimo ${MIN_CARACTERES_JUSTIFICATIVA_ESTORNO} caracteres.` };
    }

    const contrato = r.contratoId ? mockContratos.find((c) => c.id === r.contratoId && c.deletadoEm === null) : null;

    // Dependências que impedem o estorno
    if (contrato) {
      const temFixacao = mockContratoFixacoes.some(
        (f) => f.contratoId === contrato.id && f.deletadoEm === null
      );
      if (temFixacao) {
        return { sucesso: false, mensagem: "Romaneio com preço fixado — reverter a fixação antes de estornar." };
      }
      const temLiquidacao = mockContratoLiquidacoes.some(
        (l) => l.contratoId === contrato.id && l.deletadoEm === null && l.status !== "CANCELADA"
      );
      if (temLiquidacao) {
        return { sucesso: false, mensagem: "Romaneio referenciado em liquidação — reverter a liquidação antes de estornar." };
      }
    }

    const now = new Date().toISOString();
    const userId = usuarioAtualId();
    const ctx = { grupoId: r.grupoId, empresaId: r.empresaId, filialId: r.filialId };

    // 1. Reverter movimentações de estoque geradas pelo romaneio
    const movs = mockMovimentacoesEstoque.filter((m) => m.romaneioId === r.id && m.deletadoEm === null);
    for (const m of movs) {
      const saldo = estoqueService.obterSaldo(m.produtoId, m.pontoEstoqueId);
      const qtdAtual = saldo?.quantidadeAtual ?? 0;
      const nova = m.tipoMovimento === "ENTRADA"
        ? qtdAtual - m.quantidadeConvertidaBase
        : qtdAtual + m.quantidadeConvertidaBase;
      estoqueService.atualizarSaldo(m.produtoId, m.pontoEstoqueId, nova, ctx);
      m.deletadoEm = now;
      m.deletadoPor = userId;
      m.atualizadoEm = now;
      m.atualizadoPor = userId;
    }

    // 2. Status ESTORNADO com rastreabilidade (registro nunca é apagado)
    r.status = "ESTORNADO";
    r.motivoEstorno = texto;
    r.estornadoPor = userId;
    r.estornadoEm = now;
    r.atualizadoEm = now;
    r.atualizadoPor = userId;

    // 3. Saldo do contrato (cache) recalculado a partir da verdade — o
    //    romaneio ESTORNADO já não entra nas somas. Estoque em trânsito
    //    revertido na mesma operação.
    if (contrato) {
      const produtoContrato = mockProdutos.find((p) => p.id === r.produtoId);
      if (produtoContrato) {
        const unidadeRom = r.unidadeRomaneioId || getUnidadeBaseParaTipo(produtoContrato.tipoUnidade);
        try {
          const qtdContrato = unidadeMedidaService.converterQuantidade(
            pesoComercialRomaneio(r), unidadeRom, contrato.unidadeNegociacaoId, produtoContrato.id
          );
          estoqueTransitoService.registrarMovimento(contrato.id, -qtdContrato);
        } catch { /* conversão indisponível: trânsito permanece para reconciliação */ }
      }
      const s = atualizarCacheSaldoContrato(contrato);
      contrato.status = s.entregueNeg > 0 ? "PARCIAL" : "ABERTO";
      contrato.atualizadoEm = now;
      contrato.atualizadoPor = userId;
    }

    return { sucesso: true, mensagem: "Romaneio estornado. Estoque e saldo do contrato revertidos." };
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
    // Permite finalizar romaneios sem contrato desde que tenham vínculo de colheita (safra)
    if (!r.contratoId && !r.safraId) return { sucesso: false, mensagem: "Romaneio sem vínculo. Vincule a um contrato ou colheita primeiro." };
    if (!r.pontoEstoqueId) return { sucesso: false, mensagem: "Selecione um ponto de estoque antes de finalizar." };

    const contrato = r.contratoId ? mockContratos.find((c) => c.id === r.contratoId && c.deletadoEm === null) : null;
    if (r.contratoId && !contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    const produto = mockProdutos.find((p) => p.id === r.produtoId);
    if (!produto) return { sucesso: false, mensagem: "Produto não encontrado." };

    const ctx = { grupoId: r.grupoId, empresaId: r.empresaId, filialId: r.filialId };

    // FURO 1: Persistir classificações na tabela romaneio_classificacoes
    const classificacoesExistentes = mockRomaneioClassificacoes.filter(
      (rc) => rc.romaneioId === r.id && rc.deletadoEm === null
    );
    if (classificacoesExistentes.length === 0) {
      const classMap: { tipoId: string; valor: number }[] = [
        { tipoId: "ct1", valor: r.classificacaoUmidade },
        { tipoId: "ct2", valor: r.classificacaoImpureza },
        { tipoId: "ct3", valor: r.classificacaoArdidos },
        { tipoId: "ct5", valor: r.classificacaoAvariados },
      ];
      const itensParaSalvar = classMap
        .filter((c) => c.valor > 0)
        .map((c) => {
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

    // FURO 2: Conversão de unidades
    const unidadeRomaneioId = r.unidadeRomaneioId || getUnidadeBaseParaTipo(produto.tipoUnidade);
    const unidadeBaseId = getUnidadeBaseParaTipo(produto.tipoUnidade);
    let quantidadeEstoque: number;
    let quantidadeContrato = 0;

    try {
      quantidadeEstoque = unidadeMedidaService.converterQuantidade(pesoFinal, unidadeRomaneioId, unidadeBaseId, produto.id);
      if (contrato) {
        quantidadeContrato = unidadeMedidaService.converterQuantidade(pesoFinal, unidadeRomaneioId, contrato.unidadeNegociacaoId, produto.id);
      }
    } catch (e: any) {
      return { sucesso: false, mensagem: `Erro na conversão de unidades: ${e.message}` };
    }

    // TAREFA 8 — Validação de saldo/tolerância NA CAMADA DE SERVIÇO.
    // Recusa se a entrega deixar o saldo negativo além da tolerância a maior
    // definida no contrato. Dentro da tolerância: permitido.
    if (contrato) {
      const aval = avaliarToleranciaContrato(contrato, pesoFinal, unidadeRomaneioId);
      if (aval.status === "EXCEDE") return { sucesso: false, mensagem: aval.mensagem };
    }


    // Para colheita (sem contrato): sempre ENTRADA (produção colhida).
    // Para contrato: COMPRA = ENTRADA, VENDA = SAÍDA.
    const tipoMov: "ENTRADA" | "SAIDA" = contrato
      ? (contrato.tipoContrato === "COMPRA" ? "ENTRADA" : "SAIDA")
      : "ENTRADA";

    // 1. Estoque em trânsito apenas para contrato
    if (contrato) {
      estoqueTransitoService.registrarMovimento(contrato.id, quantidadeContrato);
    }

    // 2. Movimentação de estoque
    const obsMov = contrato
      ? `Romaneio ${r.id.substring(0, 8)} — Contrato ${contrato.numeroContrato}`
      : `Romaneio ${r.id.substring(0, 8)} — Colheita ${r.safraId?.substring(0, 8) ?? ""}`;
    const mov: MovimentacaoEstoque = {
      id: `mov${Date.now()}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      produtoId: r.produtoId, pontoEstoqueId: r.pontoEstoqueId,
      tipoMovimento: tipoMov,
      quantidadeInformada: pesoFinal,
      unidadeMovimentacaoId: unidadeRomaneioId,
      quantidadeConvertidaBase: quantidadeEstoque,
      dataMovimentacao: now,
      observacao: obsMov,
      contratoId: contrato?.id ?? null,
      romaneioId: r.id,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockMovimentacoesEstoque.push(mov);

    // 3. Update estoque saldo
    const saldoAtual = estoqueService.obterSaldo(r.produtoId, r.pontoEstoqueId);
    const qtdAtual = saldoAtual?.quantidadeAtual ?? 0;
    const novaQtd = tipoMov === "ENTRADA" ? qtdAtual + quantidadeEstoque : qtdAtual - quantidadeEstoque;
    estoqueService.atualizarSaldo(r.produtoId, r.pontoEstoqueId, novaQtd, ctx);

    // 4. Finalize romaneio (antes do cache: o saldo é derivado dos romaneios FINALIZADOS)
    r.status = "FINALIZADO";
    r.atualizadoEm = now; r.atualizadoPor = usuarioAtualId();

    // 5. Update contract saldo cache (apenas se houver contrato)
    if (contrato) {
      // Romaneio já está FINALIZADO neste ponto → cache recalculado a partir da verdade
      const saldo = atualizarCacheSaldoContrato(contrato);
      if (saldo.saldoNeg <= 0) contrato.status = "FINALIZADO";
      else if (saldo.entregueNeg > 0) contrato.status = "PARCIAL";
      contrato.atualizadoEm = now; contrato.atualizadoPor = usuarioAtualId();
    }

    const unRomaneio = unidadeMedidaService.obterPorId(unidadeRomaneioId);
    const unBase = unidadeMedidaService.obterPorId(unidadeBaseId);
    const msgConversao = unidadeRomaneioId !== unidadeBaseId
      ? ` | Estoque: ${quantidadeEstoque.toFixed(3)} ${unBase?.codigo ?? ""}${contrato ? ` | Contrato: ${quantidadeContrato.toFixed(3)} ${unidadeMedidaService.obterPorId(contrato.unidadeNegociacaoId)?.codigo ?? ""}` : ""}`
      : "";

    return { sucesso: true, mensagem: `Romaneio finalizado. Peso comercial: ${pesoFinal.toFixed(3)} ${unRomaneio?.codigo ?? ""}${msgConversao}. Estoque atualizado.` };
  },
  async vincularContrato(romaneioId: string, contratoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === romaneioId && x.deletadoEm === null);
    if (!r) return { sucesso: false, mensagem: "Romaneio não encontrado." };
    if (r.status !== "AGUARDANDO_CONTRATO" && r.status !== "AGUARDANDO_VINCULO" && r.status !== "AGUARDANDO_CLASSIFICACAO" && r.status !== "CLASSIFICADO") return { sucesso: false, mensagem: "Romaneio não permite mais vínculo neste status." };
    const contrato = mockContratos.find((c) => c.id === contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    const now = new Date().toISOString();
    r.contratoId = contratoId;
    r.origem = "CONTRATO";
    if (r.status === "AGUARDANDO_CONTRATO" || r.status === "AGUARDANDO_VINCULO") {
      if (r.pesoClassificado > 0) r.status = "CLASSIFICADO";
      else if (r.pesoLiquidoFisico > 0) r.status = "AGUARDANDO_CLASSIFICACAO";
      else r.status = "ABERTO";
    }
    r.atualizadoEm = now; r.atualizadoPor = usuarioAtualId();
    return { sucesso: true, mensagem: "Contrato vinculado ao romaneio." };
  },
  recalcularPesos(romaneioId: string) {
    const pesagens = mockRomaneioPesagens.filter((p) => p.romaneioId === romaneioId);
    const rom = mockRomaneios.find((r) => r.id === romaneioId);
    if (!rom) return;

    const entrada = pesagens.find((p) => p.tipoPesagem === "ENTRADA");
    const saida = pesagens.find((p) => p.tipoPesagem === "SAIDA");

    rom.pesoEntrada = entrada ? entrada.peso : 0;
    rom.pesoSaida = saida ? saida.peso : 0;

    // Determine carregado/tara based on tipoRomaneio
    if (rom.tipoRomaneio === "ENTRADA") {
      rom.pesoCarregado = rom.pesoEntrada;
      rom.pesoTara = rom.pesoSaida;
    } else {
      rom.pesoCarregado = rom.pesoSaida;
      rom.pesoTara = rom.pesoEntrada;
    }

    rom.pesoLiquidoFisico = (entrada && saida) ? Math.abs(rom.pesoCarregado - rom.pesoTara) : 0;

    // Legacy compat
    rom.pesoBruto = rom.pesoCarregado;
    rom.pesoTaraLegacy = rom.pesoTara;
    rom.pesoLiquido = rom.pesoLiquidoFisico;

    // Invalidar classificação se pesagens foram alteradas após classificação
    if (rom.status === "CLASSIFICADO") {
      rom.pesoClassificado = 0;
      rom.totalPercentualDescontos = 0;
      rom.totalPesoDescontado = 0;
      rom.pesoLiquidoSecoLimpo = 0;
      rom.dataClassificacao = null;
      rom.status = "AGUARDANDO_CLASSIFICACAO";
    } else if (rom.status !== "FINALIZADO" && rom.status !== "CANCELADO" && rom.status !== "AGUARDANDO_CLASSIFICACAO") {
      // Avulso ou vinculado: ambos vão direto para classificação após pesagem completa.
      // O vínculo (contrato/colheita) é opcional e pode ser feito antes da finalização.
      if (entrada && saida && rom.pesoLiquidoFisico > 0) {
        rom.status = "AGUARDANDO_CLASSIFICACAO";
      } else if (entrada || saida) {
        rom.status = "PESAGEM_PARCIAL";
      }
    }

    rom.atualizadoEm = new Date().toISOString();
    rom.atualizadoPor = usuarioAtualId();
  },
  async vincularColheita(romaneioId: string, safraId: string, cultivoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    await delay();
    const r = mockRomaneios.find((x) => x.id === romaneioId && x.deletadoEm === null);
    if (!r) return { sucesso: false, mensagem: "Romaneio não encontrado." };
    if (r.status !== "AGUARDANDO_VINCULO" && r.status !== "AGUARDANDO_CLASSIFICACAO" && r.status !== "CLASSIFICADO") return { sucesso: false, mensagem: "Romaneio não permite mais vínculo neste status." };

    const now = new Date().toISOString();
    r.safraId = safraId;
    r.cultivoId = cultivoId;
    r.origem = "COLHEITA";
    if (r.status === "AGUARDANDO_VINCULO") {
      r.status = r.pesoClassificado > 0 ? "CLASSIFICADO" : "AGUARDANDO_CLASSIFICACAO";
    }
    r.atualizadoEm = now;
    r.atualizadoPor = usuarioAtualId();
    return { sucesso: true, mensagem: "Colheita vinculada ao romaneio." };
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
  async salvar(data: { romaneioId: string; tipoPesagem: TipoPesagem; peso: number; origemLeitura?: string; operador?: string; observacao?: string }, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<RomaneioPesagem | { erro: string }> {
    await delay();
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
      origemLeitura: (data.origemLeitura as any) || "MANUAL",
      operador: data.operador || usuarioAtualId(),
      observacao: data.observacao || "",
      criadoEm: now, criadoPor: usuarioAtualId(),
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
    pesagem.editadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    transito.atualizadoEm = now; transito.atualizadoPor = usuarioAtualId();
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
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
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
    // 1. Quantidade entregue = soma do peso líquido FINAL (após desconto qualidade) dos romaneios
    //    FINALIZADOS, em unidade base (KG). Usa pesoLiquidoSecoLimpo se >0, senão pesoLiquido —
    //    mesma regra usada na finalização do romaneio para somar em contrato.quantidadeEntregue.
    const romaneiosFinalizados = romaneiosEntreguesDoContrato(contrato.id);
    const quantidadeEntregueBase = calcularSaldoContrato(contrato).entregueBase;

    // 1b. Converter para unidade de negociação do contrato (ex: KG → SC)
    // Helper de conversão (KG → unidade negociação do contrato)
    const produto = mockProdutos.find((p) => p.id === contrato.produtoId);
    const unidadeBaseIdConv = produto ? getUnidadeBaseParaTipo(produto.tipoUnidade) : null;
    const toNeg = (qtdBase: number): number => {
      if (!produto || !unidadeBaseIdConv || !contrato.unidadeNegociacaoId) return qtdBase;
      try {
        return unidadeMedidaService.converterQuantidade(
          qtdBase, unidadeBaseIdConv, contrato.unidadeNegociacaoId, produto.id
        );
      } catch {
        return qtdBase;
      }
    };

    // 1b. Quantidade FÍSICA entregue (antes do desconto de qualidade) — define o valor BRUTO
    const quantidadeFisicaBase = romaneiosFinalizados.reduce(
      (sum, r) => sum + ((r as any).pesoLiquidoFisico ?? r.pesoLiquido),
      0
    );
    const quantidadeFisica = toNeg(quantidadeFisicaBase);

    // 1c. Quantidade LÍQUIDA entregue (após desconto qualidade) — define o valor LÍQUIDO de qualidade
    const quantidadeEntregue = toNeg(quantidadeEntregueBase);

    // 2. Quantidade liquidada (em unidade de negociação)
    const quantidadeLiquidada = opcaoEncerrar
      ? quantidadeEntregue
      : Math.min(quantidadeEntregue, contrato.quantidadeTotal);

    // 3. Preço unitário (por unidade de negociação)
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

    // 4. Valor bruto = quantidade FÍSICA × preço (não inclui desconto de qualidade)
    const valorBruto = Math.round(quantidadeFisica * precoUnitario * 100) / 100;

    // 5. Desconto de qualidade = diferença entre física e líquida × preço
    const descontoQualidade = Math.round(
      Math.max(0, quantidadeFisica - quantidadeLiquidada) * precoUnitario * 100
    ) / 100;

    // 6. Descontos financeiros (condições do contrato), aplicados sobre o valor pós-qualidade
    const condicoes = mockContratoCondicoes
      .filter((c) => c.contratoId === contrato.id && c.deletadoEm === null)
      .sort((a, b) => a.ordemCalculo - b.ordemCalculo);

    let descontosFinanceiros = 0;
    let valorBase = valorBruto - descontoQualidade;
    for (const cond of condicoes) {
      let desconto = 0;
      if (cond.tipo === "PERCENTUAL") {
        desconto = valorBase * cond.valor / 100;
      } else {
        desconto = cond.valor;
      }
      descontosFinanceiros += desconto;
      valorBase -= desconto;
    }
    descontosFinanceiros = Math.round(descontosFinanceiros * 100) / 100;

    const valorDescontos = Math.round((descontoQualidade + descontosFinanceiros) * 100) / 100;

    // 7. Valor líquido
    const valorLiquido = Math.round((valorBruto - valorDescontos) * 100) / 100;

    // Update liquidação
    liquidacao.quantidadeContratada = contrato.quantidadeTotal;
    liquidacao.quantidadeEntregue = quantidadeFisica;
    liquidacao.quantidadeLiquidada = quantidadeLiquidada;
    liquidacao.precoUnitario = Math.round(precoUnitario * 100) / 100;
    liquidacao.valorBruto = valorBruto;
    liquidacao.valorDescontos = valorDescontos;
    liquidacao.valorLiquido = valorLiquido;
    liquidacao.atualizadoEm = now;
    liquidacao.atualizadoPor = usuarioAtualId();

    return { sucesso: true, mensagem: "Prévia de liquidação gerada.", liquidacao };
  },

  /**
   * Pré-análise (frontend chama antes de confirmar) para decidir se precisa
   * exibir modal de escolha proporcional vs última parcela.
   * Retorna cenário e o saldo a tratar.
   */
  async preAnalisar(
    liquidacaoId: string
  ): Promise<{
    sucesso: boolean;
    mensagem: string;
    cenario?: "IGUAL" | "MENOR" | "MAIOR";
    valorLiquido?: number;
    valorContaTotal?: number;
    valorPagoExistente?: number;
    saldoPendenteAtual?: number;
    diferenca?: number;
    parcelasPagasCount?: number;
    parcelasPendentesCount?: number;
    deveMostrarModal?: boolean;
    percentualReducao?: number;
    threshold?: number;
    geraraAdiantamento?: boolean;
    valorAdiantamento?: number;
  }> {
    await delay(150);
    const liquidacao = mockContratoLiquidacoes.find(
      (l) => l.id === liquidacaoId && l.deletadoEm === null
    );
    if (!liquidacao) return { sucesso: false, mensagem: "Liquidação não encontrada." };
    const contrato = mockContratos.find((c) => c.id === liquidacao.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    const contas = mockFinanceiroContas.filter(
      (fc) => fc.deletadoEm === null && fc.documentoReferencia === contrato.numeroContrato
    );
    const contaIds = contas.map((c) => c.id);
    const parcelas = mockFinanceiroParcelas.filter(
      (p) => p.deletadoEm === null && contaIds.includes(p.contaId)
    );
    const parcelasPagas = parcelas.filter((p) => p.status === "PAGO");
    const parcelasPendentes = parcelas.filter(
      (p) => p.status === "PENDENTE" || p.status === "PREVISTO" || p.status === "PARCIAL" || p.status === "VENCIDA"
    );
    const valorPagoExistente = parcelasPagas.reduce((s, p) => s + p.valorPago, 0);
    const valorContaTotal = parcelas.reduce((s, p) => s + p.valorParcela, 0);
    const saldoPendenteAtual = parcelasPendentes.reduce((s, p) => s + (p.valorParcela - p.valorPago), 0);

    const valorLiquido = liquidacao.valorLiquido;
    const diferenca = Math.round((valorLiquido - valorContaTotal) * 100) / 100;
    let cenario: "IGUAL" | "MENOR" | "MAIOR" = "IGUAL";
    if (Math.abs(diferenca) < 0.01) cenario = "IGUAL";
    else if (diferenca < 0) cenario = "MENOR";
    else cenario = "MAIOR";

    const threshold = this._obterThreshold();
    let deveMostrarModal = false;
    let percentualReducao = 0;
    let geraraAdiantamento = false;
    let valorAdiantamento = 0;

    if (cenario === "MENOR") {
      const reducao = Math.abs(diferenca);
      // Saldo real a receber/pagar = valorLiquido - jaPago
      const saldoRealRestante = valorLiquido - valorPagoExistente;
      if (saldoRealRestante < 0) {
        // Pagou mais do que o real liquidado → gera adiantamento da diferença
        geraraAdiantamento = true;
        valorAdiantamento = Math.round(Math.abs(saldoRealRestante) * 100) / 100;
      }
      // Decide modal: % sobre pendentes OU se redução > última parcela
      if (saldoPendenteAtual > 0) {
        percentualReducao = (reducao / saldoPendenteAtual) * 100;
        const ultimaParcela = parcelasPendentes
          .slice()
          .sort((a, b) => b.numeroParcela - a.numeroParcela)[0];
        const valorUltima = ultimaParcela ? ultimaParcela.valorParcela - ultimaParcela.valorPago : 0;
        if (percentualReducao > threshold || reducao > valorUltima) {
          deveMostrarModal = true;
        }
      }
    }

    return {
      sucesso: true,
      mensagem: "OK",
      cenario, valorLiquido, valorContaTotal, valorPagoExistente,
      saldoPendenteAtual, diferenca,
      parcelasPagasCount: parcelasPagas.length,
      parcelasPendentesCount: parcelasPendentes.length,
      deveMostrarModal, percentualReducao, threshold,
      geraraAdiantamento, valorAdiantamento,
    };
  },

  _obterThreshold(): number {
    const p = mockParametros.find(
      (x) => x.deletadoEm === null && x.chave === "THRESHOLD_REDACAO_DIFERENCA"
    );
    return p ? Number(p.valor) : 1.5;
  },

  _registrarMov(
    parcelaId: string | null,
    contaId: string,
    contratoId: string,
    liquidacaoId: string,
    tipo: TipoMovimentacaoAjuste,
    valorAnterior: number,
    valorNovo: number,
    motivo: string,
    ctx: { grupoId: string; empresaId: string; filialId: string },
    extras?: Record<string, any>
  ): MovimentacaoAjusteParcela {
    const now = new Date().toISOString();
    const mov: MovimentacaoAjusteParcela = {
      id: `mvaj${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
      parcelaId, contaId, contratoOrigemId: contratoId, liquidacaoId,
      tipoMovimento: tipo,
      valorAnterior: Math.round(valorAnterior * 100) / 100,
      valorNovo: Math.round(valorNovo * 100) / 100,
      diferenca: Math.round((valorNovo - valorAnterior) * 100) / 100,
      motivo, dadosExtras: extras ?? null,
      usuarioId: usuarioAtualId(), dataMovimento: now,
      criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
      deletadoEm: null, deletadoPor: null,
    };
    mockMovAjusteParcela.push(mov);
    return mov;
  },

  _calcularVencimentoBonificacao(parcelas: FinanceiroParcela[], dataLiquidacao: string): string {
    if (parcelas.length === 0) {
      const d = new Date(dataLiquidacao);
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    }
    const ultima = parcelas
      .slice()
      .sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime())[0];
    const dataUltima = new Date(ultima.dataVencimento);
    const dataLiq = new Date(dataLiquidacao);
    if (dataUltima >= dataLiq) return ultima.dataVencimento;
    const fallback = new Date(dataLiq);
    fallback.setDate(fallback.getDate() + 30);
    return fallback.toISOString().slice(0, 10);
  },

  _recalcularStatusConta(conta: FinanceiroConta) {
    const parcelas = mockFinanceiroParcelas.filter(
      (p) => p.contaId === conta.id && p.deletadoEm === null
    );
    if (parcelas.length === 0) {
      conta.status = "ABERTO";
      conta.valorTotal = 0;
      conta.valorTotalReal = 0;
      return;
    }
    const total = parcelas.reduce((s, p) => s + p.valorParcela, 0);
    const totalPago = parcelas.reduce((s, p) => s + p.valorPago, 0);
    conta.valorTotal = Math.round(total * 100) / 100;
    conta.valorTotalReal = Math.round(total * 100) / 100;
    if (totalPago <= 0) conta.status = "ABERTO";
    else if (Math.abs(totalPago - total) < 0.01) conta.status = "LIQUIDADO";
    else conta.status = "PARCIAL";
  },

  async confirmar(
    liquidacaoId: string,
    modoDistribuicao: "PROPORCIONAL" | "ULTIMA",
    ctx: { grupoId: string; empresaId: string; filialId: string },
    observacao?: string
  ): Promise<{
    sucesso: boolean;
    mensagem: string;
    resumo?: {
      cenario: "IGUAL" | "MENOR" | "MAIOR";
      parcelasAjustadas: number;
      parcelasZeradas: number;
      bonificacaoGerada: boolean;
      adiantamentoGeradoId?: string;
      adiantamentoValor?: number;
    };
  }> {
    await delay(400);
    const now = new Date().toISOString();

    const liquidacao = mockContratoLiquidacoes.find(
      (l) => l.id === liquidacaoId && l.deletadoEm === null
    );
    if (!liquidacao) return { sucesso: false, mensagem: "Liquidação não encontrada." };
    if (liquidacao.status !== "PREVIA") return { sucesso: false, mensagem: "Apenas liquidações em prévia podem ser confirmadas." };

    const contrato = mockContratos.find((c) => c.id === liquidacao.contratoId && c.deletadoEm === null);
    if (!contrato) return { sucesso: false, mensagem: "Contrato não encontrado." };

    // 1. Atualiza status liquidação
    liquidacao.status = "CONFIRMADA";
    liquidacao.dataLiquidacao = now;
    if (observacao && observacao.trim().length > 0) liquidacao.observacao = observacao.trim();
    liquidacao.atualizadoEm = now;
    liquidacao.atualizadoPor = usuarioAtualId();

    // 2. Encerra contrato
    contrato.status = "LIQUIDADO";
    contrato.atualizadoEm = now;
    contrato.atualizadoPor = usuarioAtualId();

    // 3. Zera estoque em trânsito
    const transito = mockEstoquesTransito.find(
      (t) => t.contratoId === contrato.id && t.deletadoEm === null && t.status === "ATIVO"
    );
    if (transito && transito.quantidadeSaldo > 0) {
      transito.quantidadeSaldo = 0;
      transito.status = "FINALIZADO";
      transito.atualizadoEm = now;
      transito.atualizadoPor = usuarioAtualId();
    }

    // 4. Localiza conta(s) vinculada(s) ao contrato
    const contas = mockFinanceiroContas.filter(
      (fc) => fc.deletadoEm === null && fc.documentoReferencia === contrato.numeroContrato
    );

    const resumo = {
      cenario: "IGUAL" as "IGUAL" | "MENOR" | "MAIOR",
      parcelasAjustadas: 0,
      parcelasZeradas: 0,
      bonificacaoGerada: false,
      adiantamentoGeradoId: undefined as string | undefined,
      adiantamentoValor: undefined as number | undefined,
    };

    if (contas.length === 0) {
      return { sucesso: true, mensagem: "Liquidação confirmada (sem conta financeira vinculada).", resumo };
    }

    // Agrega todas parcelas das contas vinculadas
    const todasParcelas = mockFinanceiroParcelas.filter(
      (p) => p.deletadoEm === null && contas.some((c) => c.id === p.contaId)
    );
    const parcelasPagas = todasParcelas.filter((p) => p.status === "PAGO");
    const parcelasPendentes = todasParcelas.filter(
      (p) => p.status === "PENDENTE" || p.status === "PREVISTO" || p.status === "PARCIAL" || p.status === "VENCIDA"
    );

    const valorPago = parcelasPagas.reduce((s, p) => s + p.valorPago, 0);
    const valorTotalAtual = todasParcelas.reduce((s, p) => s + p.valorParcela, 0);
    const valorLiquido = liquidacao.valorLiquido;
    const diferenca = Math.round((valorLiquido - valorTotalAtual) * 100) / 100;

    if (Math.abs(diferenca) < 0.01) {
      resumo.cenario = "IGUAL";
    } else if (diferenca < 0) {
      resumo.cenario = "MENOR";
    } else {
      resumo.cenario = "MAIOR";
    }

    // ===== CENÁRIO IGUAL → apenas promove PREVISTO → PENDENTE =====
    if (resumo.cenario === "IGUAL") {
      for (const p of parcelasPendentes) {
        if (p.status === "PREVISTO") {
          const valorAnt = p.valorParcela;
          p.status = "PENDENTE";
          p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId();
          this._registrarMov(p.id, p.contaId, contrato.id, liquidacao.id,
            "PROMOCAO_PREVISTO_PENDENTE", valorAnt, valorAnt,
            "Parcela efetivada por liquidação do contrato.", ctx);
        }
      }
    }

    // ===== CENÁRIO MENOR → reduzir pendentes + gerar adiantamento se sobrar =====
    if (resumo.cenario === "MENOR") {
      const reducao = Math.abs(diferenca);
      const saldoPendenteAtual = parcelasPendentes.reduce((s, p) => s + (p.valorParcela - p.valorPago), 0);

      // Quanto cabe nas pendentes vs quanto vira adiantamento
      const reducaoNasPendentes = Math.min(reducao, saldoPendenteAtual);
      const sobraParaAdiantamento = Math.round((reducao - reducaoNasPendentes) * 100) / 100;

      // Ordena por número (proporcional usa todas; última usa a maior numeração)
      const ordenadas = parcelasPendentes.slice().sort((a, b) => a.numeroParcela - b.numeroParcela);

      if (modoDistribuicao === "ULTIMA" && ordenadas.length > 0) {
        // Absorve tudo na(s) última(s) parcela(s) — começando pela última
        let restante = reducaoNasPendentes;
        for (let i = ordenadas.length - 1; i >= 0 && restante > 0.005; i--) {
          const p = ordenadas[i];
          const saldoP = p.valorParcela - p.valorPago;
          if (saldoP <= 0) continue;
          const corte = Math.min(saldoP, restante);
          const valorAnt = p.valorParcela;
          const valorNovo = Math.round((p.valorParcela - corte) * 100) / 100;
          p.valorParcela = valorNovo;
          p.valorReal = valorNovo;
          p.saldoParcela = Math.round((valorNovo - p.valorPago) * 100) / 100;
          if (p.status === "PREVISTO") p.status = "PENDENTE";
          if (p.saldoParcela <= 0.005 && p.valorPago <= 0.005) {
            p.tipoEspecial = "AJUSTE_NEGATIVO";
            p.motivoAjuste = "Zerada por liquidação";
            resumo.parcelasZeradas++;
          } else {
            p.tipoEspecial = "AJUSTE_NEGATIVO";
            p.motivoAjuste = `Reduzida em ${corte.toFixed(2)} por liquidação`;
            resumo.parcelasAjustadas++;
          }
          p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId();
          this._registrarMov(p.id, p.contaId, contrato.id, liquidacao.id,
            valorNovo <= 0.005 ? "PARCELA_ZERADA" : "AJUSTE_LIQUIDACAO",
            valorAnt, valorNovo,
            `Liquidação reduziu valor (modo: absorver na última). Diferença total: -${reducao.toFixed(2)}`,
            ctx);
          restante = Math.round((restante - corte) * 100) / 100;
        }
      } else {
        // PROPORCIONAL — distribui redução entre pendentes pelo peso de cada uma
        const baseSomaSaldos = ordenadas.reduce((s, p) => s + (p.valorParcela - p.valorPago), 0);
        let acumulado = 0;
        ordenadas.forEach((p, idx) => {
          const saldoP = p.valorParcela - p.valorPago;
          let corte = idx === ordenadas.length - 1
            ? Math.round((reducaoNasPendentes - acumulado) * 100) / 100
            : Math.round((reducaoNasPendentes * (saldoP / baseSomaSaldos)) * 100) / 100;
          if (corte > saldoP) corte = saldoP;
          if (corte < 0) corte = 0;
          acumulado = Math.round((acumulado + corte) * 100) / 100;
          if (corte <= 0.005 && p.status !== "PREVISTO") return;
          const valorAnt = p.valorParcela;
          const valorNovo = Math.round((p.valorParcela - corte) * 100) / 100;
          p.valorParcela = valorNovo;
          p.valorReal = valorNovo;
          p.saldoParcela = Math.round((valorNovo - p.valorPago) * 100) / 100;
          if (p.status === "PREVISTO") p.status = "PENDENTE";
          if (corte > 0.005) {
            p.tipoEspecial = "AJUSTE_NEGATIVO";
            p.motivoAjuste = `Reduzida em ${corte.toFixed(2)} por liquidação`;
            if (valorNovo <= 0.005 && p.valorPago <= 0.005) {
              resumo.parcelasZeradas++;
            } else {
              resumo.parcelasAjustadas++;
            }
            this._registrarMov(p.id, p.contaId, contrato.id, liquidacao.id,
              valorNovo <= 0.005 ? "PARCELA_ZERADA" : "AJUSTE_LIQUIDACAO",
              valorAnt, valorNovo,
              `Liquidação reduziu valor (modo: proporcional). Redução desta parcela: -${corte.toFixed(2)}`,
              ctx);
          } else {
            // Apenas promove status sem alteração
            this._registrarMov(p.id, p.contaId, contrato.id, liquidacao.id,
              "PROMOCAO_PREVISTO_PENDENTE", valorAnt, valorAnt,
              "Parcela efetivada por liquidação (sem ajuste de valor).", ctx);
          }
          p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId();
        });
      }

      // Se sobrou redução além das pendentes → gera adiantamento (crédito)
      if (sobraParaAdiantamento > 0.005) {
        const contaPrincipal = contas[0];
        const adt: FinanceiroAdiantamento = {
          id: `adt${Date.now()}`,
          grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
          pessoaId: contrato.pessoaId,
          tipoBeneficiario: "CLIENTE",
          contratoId: contrato.id,
          movimentacaoFinanceiraId: "", // sem movimento de caixa imediato
          dataAdiantamento: now.slice(0, 10),
          valorAdiantamento: sobraParaAdiantamento,
          saldoUtilizado: 0,
          saldoRestante: sobraParaAdiantamento,
          status: "ABERTO",
          origemTipo: "LIQUIDACAO_CONTRATO",
          liquidacaoOrigemId: liquidacao.id,
          contaOrigemId: contaPrincipal.id,
          observacao: `Crédito gerado por liquidação do contrato ${contrato.numeroContrato} — valor pago em excesso.`,
          criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
          deletadoEm: null, deletadoPor: null,
        };
        mockFinanceiroAdiantamentos.push(adt);
        resumo.adiantamentoGeradoId = adt.id;
        resumo.adiantamentoValor = sobraParaAdiantamento;
        this._registrarMov(null, contaPrincipal.id, contrato.id, liquidacao.id,
          "ADIANTAMENTO_GERADO", 0, sobraParaAdiantamento,
          `Adiantamento (crédito) gerado por liquidação com pagamento em excesso. Aplicável em próximas operações.`,
          ctx, { adiantamentoId: adt.id, pessoaId: contrato.pessoaId });
      }
    }

    // ===== CENÁRIO MAIOR → cria parcela de bonificação na conta principal =====
    if (resumo.cenario === "MAIOR") {
      const aumento = diferenca; // já positivo
      const contaPrincipal = contas[0];
      // Promove PREVISTO → PENDENTE primeiro (sem alterar valores das originais)
      for (const p of parcelasPendentes) {
        if (p.status === "PREVISTO") {
          const valorAnt = p.valorParcela;
          p.status = "PENDENTE";
          p.atualizadoEm = now; p.atualizadoPor = usuarioAtualId();
          this._registrarMov(p.id, p.contaId, contrato.id, liquidacao.id,
            "PROMOCAO_PREVISTO_PENDENTE", valorAnt, valorAnt,
            "Parcela efetivada por liquidação do contrato.", ctx);
        }
      }
      const parcelasDaConta = mockFinanceiroParcelas.filter(
        (p) => p.contaId === contaPrincipal.id && p.deletadoEm === null
      );
      const proxNum = parcelasDaConta.reduce((m, p) => Math.max(m, p.numeroParcela), 0) + 1;
      const vencimento = this._calcularVencimentoBonificacao(parcelasDaConta, now.slice(0, 10));
      const bonif: FinanceiroParcela = {
        id: `fpbon${Date.now()}`,
        grupoId: ctx.grupoId, empresaId: ctx.empresaId, filialId: ctx.filialId,
        contaId: contaPrincipal.id,
        numeroParcela: proxNum,
        totalParcelas: proxNum,
        dataVencimento: vencimento,
        valorParcela: aumento,
        valorReal: aumento,
        valorPago: 0,
        saldoParcela: aumento,
        status: "PENDENTE",
        tipoEspecial: "BONIFICACAO",
        motivoAjuste: `BONIFICAÇÃO - Liquidação com Ganho (+${aumento.toFixed(2)})`,
        criadoEm: now, criadoPor: usuarioAtualId(), atualizadoEm: now, atualizadoPor: usuarioAtualId(),
        deletadoEm: null, deletadoPor: null,
      };
      mockFinanceiroParcelas.push(bonif);
      // Atualiza totalParcelas das demais
      parcelasDaConta.forEach((p) => { p.totalParcelas = proxNum; });
      resumo.bonificacaoGerada = true;
      this._registrarMov(bonif.id, contaPrincipal.id, contrato.id, liquidacao.id,
        "BONIFICACAO_GERADA", 0, aumento,
        `Parcela P${proxNum} criada como bonificação (liquidação com ganho de +${aumento.toFixed(2)}).`,
        ctx, { vencimento });
    }

    // 5. Recalcula status/valores de cada conta
    for (const conta of contas) {
      this._recalcularStatusConta(conta);
      if (!conta.dataFaturamento) conta.dataFaturamento = now.slice(0, 10);
      conta.atualizadoEm = now;
      conta.atualizadoPor = usuarioAtualId();
    }

    return { sucesso: true, mensagem: "Liquidação confirmada. Contrato encerrado.", resumo };
  },

  /**
   * Lista o histórico de movimentações de ajuste vinculadas a um contrato
   * (para o painel de auditoria na aba Financeiro).
   */
  async listarHistoricoAjustes(contratoId: string): Promise<MovimentacaoAjusteParcela[]> {
    await delay(100);
    return mockMovAjusteParcela
      .filter((m) => m.deletadoEm === null && m.contratoOrigemId === contratoId)
      .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime());
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
    liquidacao.atualizadoPor = usuarioAtualId();
    return { sucesso: true, mensagem: "Liquidação cancelada." };
  },
};

// ============================================================
// Tipos de Desconto Oficiais (Cadastro Mestre)
// ============================================================
import { descontoStore } from "./mock-store";
import { supabase } from "@/integrations/supabase/client";
import type { DescontoTipo, DescontoEmpresaConfig } from "./mock-data";

export const descontoTipoService = {
  async listarAtivos(): Promise<DescontoTipo[]> {
    await delay();
    return descontoStore.getDescontoTipos().filter((d) => d.ativo);
  },
  async listarTodos(): Promise<DescontoTipo[]> {
    await delay();
    return [...descontoStore.getDescontoTipos()];
  },
  async listarConfigsPorEmpresa(empresaId: string): Promise<(DescontoEmpresaConfig & { descontoTipo: DescontoTipo })[]> {
    await delay();
    const tipos = descontoStore.getDescontoTipos();
    const configs = descontoStore.getDescontoEmpresaConfigs();
    return configs
      .filter((c) => c.empresaId === empresaId && c.ativo)
      .map((c) => ({
        ...c,
        descontoTipo: tipos.find((d) => d.id === c.descontoTipoId)!,
      }))
      .filter((c) => c.descontoTipo && c.descontoTipo.ativo);
  },
  async listarConfigsTodas(): Promise<DescontoEmpresaConfig[]> {
    await delay(50);
    return [...descontoStore.getDescontoEmpresaConfigs()];
  },
  async salvarTipo(data: DescontoTipo): Promise<DescontoTipo> {
    await delay(50);
    const tipos = descontoStore.getDescontoTipos();
    if (data.id && tipos.some((d) => d.id === data.id)) {
      descontoStore.setDescontoTipos(tipos.map((d) => (d.id === data.id ? { ...data } : d)));
      return data;
    }
    const novo = { ...data, id: `dt${Date.now()}` };
    descontoStore.setDescontoTipos([...tipos, novo]);
    return novo;
  },
  async excluirTipo(id: string): Promise<void> {
    exigirPermissao("EXCLUIR_CADASTRO_ESTRUTURAL");
    await delay(50);
    descontoStore.setDescontoTipos(descontoStore.getDescontoTipos().filter((d) => d.id !== id));
    descontoStore.setDescontoEmpresaConfigs(descontoStore.getDescontoEmpresaConfigs().filter((c) => c.descontoTipoId !== id));
  },
  async salvarConfig(data: Omit<DescontoEmpresaConfig, "id"> & { id?: string }): Promise<DescontoEmpresaConfig> {
    await delay(50);
    const configs = descontoStore.getDescontoEmpresaConfigs();
    if (data.id && configs.some((c) => c.id === data.id)) {
      const upd = { ...(configs.find((c) => c.id === data.id) as DescontoEmpresaConfig), ...data } as DescontoEmpresaConfig;
      descontoStore.setDescontoEmpresaConfigs(configs.map((c) => (c.id === data.id ? upd : c)));
      return upd;
    }
    const novo = { ...data, id: `dec${Date.now()}` } as DescontoEmpresaConfig;
    descontoStore.setDescontoEmpresaConfigs([...configs, novo]);
    return novo;
  },
  async excluirConfig(id: string): Promise<void> {
    await delay(50);
    descontoStore.setDescontoEmpresaConfigs(descontoStore.getDescontoEmpresaConfigs().filter((c) => c.id !== id));
  },
};

// ============================================================
// FASE 1 — Autorização de supervisor (reautenticação real)
// ------------------------------------------------------------
// A senha validada é SEMPRE a do usuário logado que executa a ação, e o
// perfil dele precisa ter a permissão AUTORIZAR_SUPERVISOR.
// Fluxo de dois usuários (operador pede / supervisor autoriza com a própria
// senha) fica registrado como evolução futura — fora do escopo desta fase.
//
// ESCOPO das ações que exigem supervisor:
//   1. Registrar Adiantamento de Cliente
//   2. Estorno de romaneio finalizado
//   3. Exclusão de Condições e Descontos
//   4. Exclusão de Moedas e Cotações
//   5. Exclusão de Plano de Contas e Centros de Custo
// ============================================================
export type AcaoSupervisionada =
  | "ADIANTAMENTO_CLIENTE"
  | "ESTORNO_ROMANEIO"
  | "EXCLUIR_CONDICAO_DESCONTO"
  | "EXCLUIR_MOEDA_COTACAO"
  | "EXCLUIR_PLANO_CONTAS"
  | "EXCLUIR_CENTRO_CUSTO";

export const ROTULO_ACAO_SUPERVISIONADA: Record<AcaoSupervisionada, string> = {
  ADIANTAMENTO_CLIENTE: "Registrar Adiantamento de Cliente",
  ESTORNO_ROMANEIO: "Estorno de romaneio finalizado",
  EXCLUIR_CONDICAO_DESCONTO: "Exclusão de Condições e Descontos",
  EXCLUIR_MOEDA_COTACAO: "Exclusão de Moedas e Cotações",
  EXCLUIR_PLANO_CONTAS: "Exclusão de Plano de Contas",
  EXCLUIR_CENTRO_CUSTO: "Exclusão de Centro de Custo",
};

export interface AlvoAutorizacao {
  tipo: string;
  id: string;
  descricao?: string;
}

export interface RegistroAutorizacao {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  registroTipo: string;
  registroId: string;
  descricao: string;
  justificativa: string;
  resultado: string;
  criadoEm: string;
}

async function gravarLogAutorizacao(params: {
  acao: AcaoSupervisionada;
  alvo: AlvoAutorizacao;
  justificativa?: string;
  resultado: "AUTORIZADO" | "RECUSADO" | "CANCELADO";
}): Promise<void> {
  const s = _sessao;
  if (!s) throw new Error("Sessão expirada. Entre novamente.");
  const uuidOuNulo = (v: string) => (UUID_RE.test(v) ? v : null);
  // Código estável da ação (mesmo código gravado pelas funções do banco,
  // ex.: estornar_romaneio → ESTORNO_ROMANEIO). O rótulo é só exibição.
  const { error } = await supabase.from("autorizacoes_log").insert({
    usuario_id: s.id,
    usuario_nome: s.nome,
    acao: params.acao,
    registro_tipo: params.alvo.tipo,
    registro_id: params.alvo.id,
    descricao: params.alvo.descricao ?? "",
    justificativa: params.justificativa ?? "",
    resultado: params.resultado,
    grupo_id: uuidOuNulo(s.grupoId),
    empresa_id: uuidOuNulo(s.empresaId),
    filial_id: uuidOuNulo(s.filialId),
  });
  // Sem log não há autorização: falha de gravação interrompe a operação.
  if (error) throw new Error("Não foi possível registrar a autorização no log: " + error.message);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const autorizacaoService = {
  /**
   * Reautentica o usuário logado com a SENHA REAL dele e registra o
   * resultado no log de autorizações — inclusive quando é recusado.
   */
  async validarSupervisor(
    senha: string,
    contexto?: { acao: AcaoSupervisionada; alvo: AlvoAutorizacao; justificativa?: string }
  ): Promise<{ ok: boolean; mensagem: string; token?: string }> {
    const s = _sessao;
    if (!s) return { ok: false, mensagem: "Sessão expirada. Entre novamente." };
    if (!podeExecutar("AUTORIZAR_SUPERVISOR")) {
      if (contexto) await gravarLogAutorizacao({ ...contexto, resultado: "RECUSADO" });
      return { ok: false, mensagem: "Seu perfil não tem permissão para autorizar esta operação." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: s.email, password: senha });
    if (error) {
      if (contexto) await gravarLogAutorizacao({ ...contexto, resultado: "RECUSADO" });
      return { ok: false, mensagem: "Senha inválida." };
    }
    if (contexto) await gravarLogAutorizacao({ ...contexto, resultado: "AUTORIZADO" });
    const token = contexto ? emitirTokenAutorizacao(contexto.acao, contexto.alvo.id) : undefined;
    return { ok: true, mensagem: "Autorizado.", token };
  },

  /** Registro explícito (ex.: usuário cancelou a janela). */
  async registrarTentativa(
    acao: AcaoSupervisionada,
    alvo: AlvoAutorizacao,
    resultado: "CANCELADO" | "RECUSADO",
    justificativa?: string
  ): Promise<void> {
    await gravarLogAutorizacao({ acao, alvo, justificativa, resultado });
  },

  async listarLog(filtros?: {
    usuarioId?: string;
    acao?: string;
    de?: string;
    ate?: string;
  }): Promise<RegistroAutorizacao[]> {
    let q = supabase.from("autorizacoes_log").select("*").order("criado_em", { ascending: false }).limit(500);
    if (filtros?.usuarioId) q = q.eq("usuario_id", filtros.usuarioId);
    if (filtros?.acao) q = q.eq("acao", filtros.acao);
    if (filtros?.de) q = q.gte("criado_em", filtros.de);
    if (filtros?.ate) q = q.lte("criado_em", filtros.ate);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      usuarioId: r.usuario_id,
      usuarioNome: r.usuario_nome,
      acao: r.acao,
      registroTipo: r.registro_tipo,
      registroId: r.registro_id,
      descricao: r.descricao,
      justificativa: r.justificativa,
      resultado: r.resultado,
      criadoEm: r.criado_em,
    }));
  },
};
