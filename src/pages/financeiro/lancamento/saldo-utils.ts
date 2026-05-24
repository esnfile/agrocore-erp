import type { FinanceiroContaFinanceira, FinanceiroTipoConta } from "@/lib/mock-data";

export type TipoContaDescricao = "CAIXA" | "BANCO" | "CARTEIRA" | null;

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function getTipoContaDescricao(
  conta: FinanceiroContaFinanceira | undefined,
  tiposContas: FinanceiroTipoConta[],
): TipoContaDescricao {
  if (!conta) return null;
  const d = tiposContas.find((t) => t.id === conta.tipoContaId)?.descricao?.toUpperCase();
  if (d === "CAIXA" || d === "BANCO" || d === "CARTEIRA") return d;
  return null;
}

export type AvaliacaoSaldo = {
  status: "ok" | "aviso" | "bloqueado";
  saldoResultante: number;
  mensagem: string | null;
};

export function avaliarSaldo(
  conta: FinanceiroContaFinanceira | undefined,
  tiposContas: FinanceiroTipoConta[],
  valor: number,
): AvaliacaoSaldo {
  if (!conta || !valor || valor <= 0) {
    return { status: "ok", saldoResultante: conta?.saldoAtual ?? 0, mensagem: null };
  }
  const tipo = getTipoContaDescricao(conta, tiposContas);
  const saldoResultante = +(conta.saldoAtual - valor).toFixed(2);

  if (tipo === "CAIXA" || tipo === "CARTEIRA") {
    if (saldoResultante < 0) {
      return {
        status: "bloqueado",
        saldoResultante,
        mensagem: `Saldo insuficiente em "${conta.descricao}". Operação não permitida.`,
      };
    }
    return { status: "ok", saldoResultante, mensagem: null };
  }

  if (tipo === "BANCO") {
    const limite = conta.limiteCreditoBancario ?? 0;
    if (saldoResultante >= 0) {
      return { status: "ok", saldoResultante, mensagem: null };
    }
    if (saldoResultante >= -limite) {
      return {
        status: "aviso",
        saldoResultante,
        mensagem: `Aviso: saldo entrará em limite de crédito. Resultante: ${fmtBRL(saldoResultante)}.`,
      };
    }
    return {
      status: "bloqueado",
      saldoResultante,
      mensagem: limite > 0
        ? `Limite de crédito de ${fmtBRL(limite)} ultrapassado. Operação não permitida.`
        : `Saldo insuficiente em "${conta.descricao}". Operação não permitida.`,
    };
  }

  // Tipo desconhecido: tratar como CAIXA (mais restritivo)
  if (saldoResultante < 0) {
    return {
      status: "bloqueado",
      saldoResultante,
      mensagem: `Saldo insuficiente em "${conta.descricao}". Operação não permitida.`,
    };
  }
  return { status: "ok", saldoResultante, mensagem: null };
}
