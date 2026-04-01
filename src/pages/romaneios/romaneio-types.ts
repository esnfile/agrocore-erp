// ============================================================
// Romaneio Module — Shared Types, Constants & Helpers
// ============================================================

export type StatusRomaneioNew = 
  | "RASCUNHO"
  | "AGUARDANDO_PESAGEM"
  | "PESAGEM_PARCIAL"
  | "AGUARDANDO_VINCULO"
  | "AGUARDANDO_CLASSIFICACAO"
  | "CLASSIFICADO"
  | "FINALIZADO"
  | "CANCELADO";

export type OrigemRomaneio = "CONTRATO" | "COLHEITA" | "AVULSO";
export type TipoRomaneio = "ENTRADA" | "SAIDA";

export const STATUS_LABELS: Record<StatusRomaneioNew, string> = {
  RASCUNHO: "Rascunho",
  AGUARDANDO_PESAGEM: "Aguard. Pesagem",
  PESAGEM_PARCIAL: "Pesagem Parcial",
  AGUARDANDO_VINCULO: "Aguard. Vínculo",
  AGUARDANDO_CLASSIFICACAO: "Aguard. Classificação",
  CLASSIFICADO: "Classificado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

// Badge className for each status — used directly in className prop
export const STATUS_BADGE_CLASSES: Record<StatusRomaneioNew, string> = {
  RASCUNHO: "bg-gray-100 text-gray-700 border-gray-300",
  AGUARDANDO_PESAGEM: "bg-amber-100 text-amber-800 border-amber-300",
  PESAGEM_PARCIAL: "bg-amber-100 text-amber-800 border-amber-300",
  AGUARDANDO_VINCULO: "bg-slate-100 text-slate-700 border-slate-300",
  AGUARDANDO_CLASSIFICACAO: "bg-sky-100 text-sky-700 border-sky-300",
  CLASSIFICADO: "bg-blue-100 text-blue-700 border-blue-300",
  FINALIZADO: "bg-green-600 text-white border-green-700",
  CANCELADO: "bg-red-100 text-red-700 border-red-300",
};

// Keep STATUS_COLORS for backward compat but prefer STATUS_BADGE_CLASSES
export const STATUS_COLORS: Record<StatusRomaneioNew, "default" | "secondary" | "destructive" | "outline"> = {
  RASCUNHO: "outline",
  AGUARDANDO_PESAGEM: "secondary",
  PESAGEM_PARCIAL: "secondary",
  AGUARDANDO_VINCULO: "outline",
  AGUARDANDO_CLASSIFICACAO: "secondary",
  CLASSIFICADO: "default",
  FINALIZADO: "default",
  CANCELADO: "destructive",
};

export const ORIGEM_LABELS: Record<OrigemRomaneio, string> = {
  CONTRATO: "Contrato",
  COLHEITA: "Colheita",
  AVULSO: "Avulso",
};

export const TIPO_LABELS: Record<TipoRomaneio, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const STEPPER_STEPS = [
  { id: 1, label: "Identificação", description: "Contexto e vínculo" },
  { id: 2, label: "Pesagens", description: "Entrada e saída" },
  { id: 3, label: "Vínculo", description: "Vínculo definitivo" },
  { id: 4, label: "Classificação", description: "Qualidade e descontos" },
  { id: 5, label: "Fechamento", description: "Estoque e finalização" },
] as const;

// Safra/Cultivo reference data (until these are moved to mock-data.ts)
export const SAFRAS_REF = [
  { id: "saf1", nome: "Safra 2024/2025", empresaId: "e1", filialId: "f1" },
  { id: "saf2", nome: "Safra 2023/2024", empresaId: "e1", filialId: "f2" },
  { id: "saf3", nome: "Safra 2025/2026", empresaId: "e2", filialId: "f3" },
  { id: "saf4", nome: "Safrinha 2025", empresaId: "e1", filialId: "f1" },
];

export const CULTIVOS_REF = [
  { id: "cult1", safraId: "saf1", nome: "Soja — TMG 2381", produto: "Soja", empresaId: "e1", filialId: "f1" },
  { id: "cult2", safraId: "saf1", nome: "Milho — AG 9025", produto: "Milho", empresaId: "e1", filialId: "f1" },
  { id: "cult3", safraId: "saf2", nome: "Soja — NS 7901", produto: "Soja", empresaId: "e1", filialId: "f2" },
];

/**
 * Determines the allowed step based on romaneio status.
 * Returns the maximum step the user can access.
 */
export function getMaxStepForStatus(status: StatusRomaneioNew): number {
  switch (status) {
    case "RASCUNHO": return 1;
    case "AGUARDANDO_PESAGEM": return 2;
    case "PESAGEM_PARCIAL": return 2;
    case "AGUARDANDO_VINCULO": return 3;
    case "AGUARDANDO_CLASSIFICACAO": return 4;
    case "CLASSIFICADO": return 5;
    case "FINALIZADO": return 5;
    case "CANCELADO": return 5;
    default: return 1;
  }
}

/**
 * Determines the current step based on status (where the user should land).
 */
export function getCurrentStepForStatus(status: StatusRomaneioNew): number {
  switch (status) {
    case "RASCUNHO": return 1;
    case "AGUARDANDO_PESAGEM": return 2;
    case "PESAGEM_PARCIAL": return 2;
    case "AGUARDANDO_VINCULO": return 3;
    case "AGUARDANDO_CLASSIFICACAO": return 4;
    case "CLASSIFICADO": return 5;
    case "FINALIZADO": return 5;
    case "CANCELADO": return 1;
    default: return 1;
  }
}

export function isStepAccessible(stepNumber: number, status: StatusRomaneioNew): boolean {
  return stepNumber <= getMaxStepForStatus(status);
}

export function isRomaneioEditable(status: StatusRomaneioNew): boolean {
  return status !== "FINALIZADO" && status !== "CANCELADO";
}

// ---- Dual-unit contract display helpers ----
import { unidadesMedida } from "@/lib/mock-data";
import { produtos as mockProdutos } from "@/lib/mock-data";
import type { Contrato, Produto, UnidadeMedida } from "@/lib/mock-data";

export interface ContratoUnidadeInfo {
  unidadeCodigo: string; // e.g. "SC", "KG"
  fatorParaKg: number;   // e.g. 60 for SC
  isKg: boolean;         // true if negotiation unit is already KG
  totalOriginal: number;
  totalKg: number;
  entregueOriginal: number;
  entregueKg: number;
  saldoOriginal: number;
  saldoKg: number;
}

/**
 * Resolves the contract's negotiation unit info for dual-unit display.
 * Uses the product's unit config (entrada/saida) + the contract's unidadeNegociacaoId.
 */
export function resolveContratoUnidadeInfo(contrato: Contrato, tipoRomaneio?: TipoRomaneio): ContratoUnidadeInfo {
  const unidade = unidadesMedida.find((u) => u.id === contrato.unidadeNegociacaoId && u.deletadoEm === null);
  const codigo = unidade?.codigo || "KG";
  const fator = unidade?.fatorBase || 1;
  const isKg = fator === 1; // KG has fatorBase = 1

  return {
    unidadeCodigo: codigo,
    fatorParaKg: fator,
    isKg,
    totalOriginal: contrato.quantidadeTotal,
    totalKg: contrato.quantidadeTotal * fator,
    entregueOriginal: contrato.quantidadeEntregue,
    entregueKg: contrato.quantidadeEntregue * fator,
    saldoOriginal: contrato.quantidadeSaldo,
    saldoKg: contrato.quantidadeSaldo * fator,
  };
}

/**
 * Formats a quantity with dual-unit display.
 * If the unit is KG, shows only "X kg".
 * Otherwise shows "X SC / Y kg".
 */
export function fmtDualUnit(valor: number, info: ContratoUnidadeInfo, decimals = 0): string {
  if (info.isKg) {
    return `${valor.toFixed(decimals)} kg`;
  }
  const valorKg = valor * info.fatorParaKg;
  return `${valor.toFixed(decimals)} ${info.unidadeCodigo.toLowerCase()} / ${valorKg.toFixed(decimals)} kg`;
}

/**
 * Formats contract saldo for dropdown display.
 */
export function fmtContratoSaldo(contrato: Contrato): string {
  const info = resolveContratoUnidadeInfo(contrato);
  if (contrato.quantidadeSaldo <= 0) return "(sem saldo)";
  if (info.isKg) {
    return `(saldo: ${contrato.quantidadeSaldo.toFixed(0)} kg)`;
  }
  return `(saldo: ${contrato.quantidadeSaldo.toFixed(0)} ${info.unidadeCodigo.toLowerCase()} / ${info.saldoKg.toFixed(0)} kg)`;
}
