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
