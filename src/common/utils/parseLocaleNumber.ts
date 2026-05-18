/**
 * Interpreta números con coma o punto (es-AR / en-US) para datos numéricos en formularios.
 */
export function parseLocaleNumber(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "");
  if (!t) return null;
  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");
  let normalized = t;
  if (lastComma > lastDot) {
    normalized = t.replace(/\./g, "").replace(",", ".");
  } else if (lastComma >= 0 && lastDot > lastComma) {
    normalized = t.replace(/,/g, "");
  } else if (lastComma >= 0 && lastDot < 0) {
    normalized = t.replace(",", ".");
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}
