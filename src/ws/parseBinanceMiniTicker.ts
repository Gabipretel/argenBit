/**
 * Combined stream Binance: mensaje `{ stream, data }` donde `data` es JSON del evento `24hrMiniTicker`.
 */
export function parseBinanceMiniTicker(raw: string): { fsym: string; price: number } | null {
  try {
    const outer = JSON.parse(raw) as unknown;
    if (!outer || typeof outer !== "object") return null;
    const o = outer as Record<string, unknown>;
    const innerRaw = o.data ?? o;
    const inner =
      typeof innerRaw === "string" ? (JSON.parse(innerRaw) as unknown) : innerRaw;
    if (!inner || typeof inner !== "object") return null;
    const row = inner as Record<string, unknown>;
    if (row.e !== "24hrMiniTicker" && row.e !== "24hrTicker") return null;
    const pair = String(row.s ?? "").trim().toUpperCase();
    if (!pair.endsWith("USDT")) return null;
    const base = pair.slice(0, -4);
    if (!base) return null;
    const c = row.c;
    const price =
      typeof c === "number" ? c : parseFloat(String(c ?? ""));
    if (!Number.isFinite(price)) return null;
    return { fsym: base, price };
  } catch {
    return null;
  }
}
