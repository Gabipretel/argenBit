
export type BinancePriceTick = {
  fsym: string;
  price: number;
  /** Variación % en la ventana 24 h de Binance. */
  changePercent24Hr?: number;
};

function parseTickerNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseFloat(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

/** % desde precio de apertura de la ventana y último precio. */
function changePercentFromOpenClose(open: number, close: number): number | null {
  if (!(open > 0) || !Number.isFinite(close)) return null;
  return ((close - open) / open) * 100;
}

export function parseBinanceMiniTicker(raw: string): BinancePriceTick | null {
  try {
    const outer = JSON.parse(raw) as unknown;
    if (!outer || typeof outer !== "object") return null;
    const outerObj = outer as Record<string, unknown>;
    const innerRaw = outerObj.data ?? outerObj;
    const inner =
      typeof innerRaw === "string" ? (JSON.parse(innerRaw) as unknown) : innerRaw;
    if (!inner || typeof inner !== "object") return null;
    const row = inner as Record<string, unknown>;
    if (row.e !== "24hrMiniTicker" && row.e !== "24hrTicker") return null;
    const pair = String(row.s ?? "").trim().toUpperCase();
    if (!pair.endsWith("USDT")) return null;
    const base = pair.slice(0, -4);
    if (!base) return null;
    const close = parseTickerNumber(row.c);
    if (close === null) return null;

    let changePercent24Hr: number | undefined;
    const pPct = parseTickerNumber(row.P);
    if (pPct !== null) {
      changePercent24Hr = pPct;
    } else {
      const open = parseTickerNumber(row.o);
      const derived = open !== null ? changePercentFromOpenClose(open, close) : null;
      if (derived !== null) changePercent24Hr = derived;
    }

    const out: BinancePriceTick = { fsym: base, price: close };
    if (changePercent24Hr !== undefined) out.changePercent24Hr = changePercent24Hr;
    return out;
  } catch {
    return null;
  }
}
