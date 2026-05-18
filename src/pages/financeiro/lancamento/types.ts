import type { CategoriaTipoLancamento } from "@/lib/mock-data";

export interface FormasPagamentoState {
  dinheiro: number;
  cheque: number;
  cartao: number;
  adiantamento: number;
}

export interface LancamentoFormState {
  // Dados base
  empresaId: string;
  filialId: string;
  contaFinanceiraId: string;
  dataMovimento: string;
  tipoLancamentoId: string;
  // Detalhes (varia por categoria)
  socioId: string;
  valorDetalhe: number;
  centroCustoId: string;
  // Formas de pagamento
  formas: FormasPagamentoState;
  // Histórico
  historico: string;
}

export const initialFormState = (empresaId: string, filialId: string): LancamentoFormState => ({
  empresaId,
  filialId,
  contaFinanceiraId: "",
  dataMovimento: new Date().toISOString().slice(0, 10),
  tipoLancamentoId: "",
  socioId: "",
  valorDetalhe: 0,
  centroCustoId: "",
  formas: { dinheiro: 0, cheque: 0, cartao: 0, adiantamento: 0 },
  historico: "",
});

export const sumFormas = (f: FormasPagamentoState) =>
  (f.dinheiro || 0) + (f.cheque || 0) + (f.cartao || 0) + (f.adiantamento || 0);

export const categoriasImplementadas: CategoriaTipoLancamento[] = ["PROLABORE"];
