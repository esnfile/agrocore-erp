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

// Adiantamento de Cliente exige autorização de supervisor (mock).
// TODO: substituir por verificação de permissão real quando o módulo de Usuários/Permissões existir.
export const REQUER_AUTORIZACAO_ADIANT_CLIENTE = true;
export const SENHA_SUPERVISOR_MOCK = "admin123";
