import type { CategoriaTipoLancamento } from "@/lib/mock-data";

export interface FormasPagamentoState {
  dinheiro: number;
  cheque: number;
  cartao: number;
  adiantamento: number;
}

export interface AdiantamentoUso {
  adiantamentoId: string;
  valor: number;
}

export interface ComposicaoDinheiroItem {
  formaId: string;
  valor: number;
}


export interface LancamentoFormState {
  // Dados base
  empresaId: string;
  filialId: string;
  contaFinanceiraId: string;
  contaDestinoId: string; // Transferência
  dataMovimento: string;
  tipoLancamentoId: string;
  // Detalhes (varia por categoria)
  socioId: string;          // Prolabore
  pessoaId: string;         // Fornecedor / Cliente
  solicitacaoAdiantamentoId: string; // Fornecedor: solicitação aprovada selecionada
  referenciaMotivo: string; // Cliente: motivo obrigatório (adiantamento)
  valorDetalhe: number;
  centroCustoId: string;
  // Duplicatas (REC/PAG_DUPLICATA)
  parcelasSelecionadas: string[];
  adiantamentosSelecionados: AdiantamentoUso[];
  // Geral (categoria GERAL) — multa/juros somam, descontos subtrai. totalGeral é derivado.
  multa: number;
  juros: number;
  descontos: number;
  totalGeral: number;
  // Formas de pagamento
  formas: FormasPagamentoState;
  // Composição detalhada do campo "Dinheiro" (Dinheiro Físico, PIX, Transferência, etc.)
  composicaoDinheiro: ComposicaoDinheiroItem[];
  // Histórico
  historico: string;
}


export const initialFormState = (empresaId: string, filialId: string): LancamentoFormState => ({
  empresaId,
  filialId,
  contaFinanceiraId: "",
  contaDestinoId: "",
  dataMovimento: new Date().toISOString().slice(0, 10),
  tipoLancamentoId: "",
  socioId: "",
  pessoaId: "",
  solicitacaoAdiantamentoId: "",
  referenciaMotivo: "",
  valorDetalhe: 0,
  centroCustoId: "",
  parcelasSelecionadas: [],
  adiantamentosSelecionados: [],
  multa: 0,
  juros: 0,
  descontos: 0,
  totalGeral: 0,
  formas: { dinheiro: 0, cheque: 0, cartao: 0, adiantamento: 0 },
  composicaoDinheiro: [],
  historico: "",
});

export const sumFormas = (f: FormasPagamentoState) =>
  (f.dinheiro || 0) + (f.cheque || 0) + (f.cartao || 0) + (f.adiantamento || 0);

export const sumComposicao = (itens: ComposicaoDinheiroItem[]) =>
  itens.reduce((s, i) => s + (i.valor || 0), 0);


export const categoriasImplementadas: CategoriaTipoLancamento[] = [
  "PROLABORE",
  "ADIANT_FORNECEDOR",
  "ADIANT_CLIENTE",
  "REC_DUPLICATA",
  "PAG_DUPLICATA",
  "GERAL",
  "TRANSFERENCIA",
];

