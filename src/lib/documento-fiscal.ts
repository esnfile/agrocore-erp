// Validação de CPF/CNPJ por dígito verificador. Espelha public.documento_valido (banco é a autoridade final).
const soDigitos = (s: string) => (s ?? "").replace(/\D/g, "");

export function cpfValido(v: string): boolean {
  const s = soDigitos(v);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  for (let t = 9; t < 11; t++) {
    let x = 0;
    for (let i = 0; i < t; i++) x += +s[i] * (t + 1 - i);
    if (((x * 10) % 11) % 10 !== +s[t]) return false;
  }
  return true;
}

export function cnpjValido(v: string): boolean {
  const s = soDigitos(v);
  if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
  const w = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const t of [12, 13]) {
    let x = 0;
    for (let i = 0; i < t; i++) x += +s[i] * w[w.length - t + i];
    const r = x % 11 < 2 ? 0 : 11 - (x % 11);
    if (r !== +s[t]) return false;
  }
  return true;
}

export const documentoValido = (v: string) => cpfValido(v) || cnpjValido(v);

/** Inscrição Estadual: validação básica de formato (ISENTO ou 8 a 14 dígitos). */
export function ieValida(v: string): boolean {
  const t = (v ?? "").trim();
  if (!t) return true;
  if (t.toUpperCase() === "ISENTO") return true;
  const d = soDigitos(t);
  return d.length >= 8 && d.length <= 14;
}
