export function formatUsd(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  }).format(n);
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatSupply(n: number): string {
  if (n >= 1_000_000) return formatCompactNumber(n);
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
}

/** Puntaje CoinStats 0–100 (riesgo, volatilidad, liquidez). */
export function formatScore0to100(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
