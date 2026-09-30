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

/** IE de Mato Grosso: 11 dígitos (completa zeros à esquerda), pesos 3,2,9,8,7,6,5,4,3,2, DV = 11 - (soma % 11); 10/11 => 0. */
export function ieMtValida(v: string): boolean {
  const d = soDigitos(v);
  if (d.length < 9 || d.length > 11) return false;
  const s = d.padStart(11, "0");
  if (/^(\d)\1+$/.test(s)) return false;
  const w = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let x = 0;
  for (let i = 0; i < 10; i++) x += +s[i] * w[i];
  const r = 11 - (x % 11);
  return (r >= 10 ? 0 : r) === +s[10];
}

/** Erro de IE ou null. MT: formato + dígito. Demais UFs: genérica (8–14 dígitos) — validação completa por UF no backlog .NET. */
export function ieErro(v: string, uf?: string): string | null {
  const t = (v ?? "").trim();
  if (!t || t.toUpperCase() === "ISENTO") return null;
  if (/[^\d.\-/ ]/.test(t)) return "IE inválida — use apenas números ou ISENTO.";
  if ((uf ?? "").toUpperCase() === "MT") {
    return ieMtValida(t) ? null : "IE de MT inválida — 9 a 11 dígitos e dígito verificador deve conferir.";
  }
  const d = soDigitos(t);
  return d.length >= 8 && d.length <= 14 ? null : "IE inválida — informe ISENTO ou de 8 a 14 dígitos.";
}

export const ieValida = (v: string, uf?: string) => ieErro(v, uf) === null;
