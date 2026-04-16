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
