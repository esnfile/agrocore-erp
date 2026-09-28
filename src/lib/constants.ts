// ============================================================
// AgroERP — Constantes
// ============================================================

export const ESTADOS_BRASILEIROS = [
  { sigla: "AC" },
  { sigla: "AL" },
  { sigla: "AM" },
  { sigla: "AP" },
  { sigla: "BA" },
  { sigla: "CE" },
  { sigla: "DF" },
  { sigla: "ES" },
  { sigla: "GO" },
  { sigla: "MA" },
  { sigla: "MG" },
  { sigla: "MS" },
  { sigla: "MT" },
  { sigla: "PA" },
  { sigla: "PB" },
  { sigla: "PE" },
  { sigla: "PI" },
  { sigla: "PR" },
  { sigla: "RJ" },
  { sigla: "RN" },
  { sigla: "RO" },
  { sigla: "RR" },
  { sigla: "RS" },
  { sigla: "SC" },
  { sigla: "SE" },
  { sigla: "SP" },
  { sigla: "TO" },
] as const;

// Adiantamento de Cliente exige autorização de supervisor.
// Fase 1: a janela reautentica com a SENHA REAL do usuário logado.
export const REQUER_AUTORIZACAO_ADIANT_CLIENTE = true;

// Justificativa obrigatória no estorno de romaneio finalizado.
export const MIN_CARACTERES_JUSTIFICATIVA_ESTORNO = 20;
