/**
 * Mensajes TYPE `5` — precio agregado CCCAGG (streamer CryptoCompare).
 * Campos pueden variar; cubrimos variantes habituales.
 */
export function parseStreamerPrice(raw: string): { fsym: string; price: number } | null {
  try {
    const msg = JSON.parse(raw) as unknown;
    const items = Array.isArray(msg) ? msg : [msg];
    for (const m of items) {
      if (!m || typeof m !== "object") continue;
      const row = m as Record<string, unknown>;
      const type = row.TYPE ?? row.Type;
      if (type !== "5" && type !== 5) continue;

      const symRaw =
        row.FROMSYM ??
        row.FROMSYMBOL ??
        row.FSYM ??
        row.FromSymbol ??
        row.fs ??
        "";
      const sym = String(symRaw).trim().toUpperCase();

      const priceRaw = row.PRICE ?? row.P ?? row.CLOSE ?? row.LAST_TRADE_PRICE;
      const price =
        typeof priceRaw === "number"
          ? priceRaw
          : parseFloat(String(priceRaw ?? ""));

      if (sym && Number.isFinite(price)) {
        return { fsym: sym, price };
      }
    }
  } catch {
    return null;
  }
  return null;
}
