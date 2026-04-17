// ============================================================
// Formatação dinâmica de moeda
// ============================================================
// Aplica símbolo + locale numérico sem usar Intl currency (que
// força código ISO). Permite símbolos arbitrários (R$, $, €, £).

export function formatMoeda(valor: number, simbolo: string = "R$"): string {
  const useEnUs = simbolo === "$" || simbolo === "£";
  const formatted = (valor || 0).toLocaleString(useEnUs ? "en-US" : "pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${simbolo} ${formatted}`;
}

// ============================================================
// Formatação de datas — evita timezone shift
// ============================================================
// "YYYY-MM-DD" parseado por `new Date()` vira UTC midnight, e
// `toLocaleDateString` em fusos negativos (BRT -3) mostra D-1.
// Estas helpers tratam a string como data local (sem hora).

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const dmy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmy) {
    const d = dmy[1].padStart(2, "0");
    const m = dmy[2].padStart(2, "0");
    let y = dmy[3]; if (y.length === 2) y = `20${y}`;
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

export function parseDateLocal(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmy) {
    let y = parseInt(dmy[3]); if (y < 100) y += 2000;
    return new Date(y, parseInt(dmy[2]) - 1, parseInt(dmy[1]));
  }
  return null;
}
