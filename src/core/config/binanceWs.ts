/** Máximo de streams  */
export const MAX_BINANCE_STREAMS = 80;

const BINANCE_COMBINED = "wss://data-stream.binance.vision/stream";

export function binanceMiniTickerUrl(streamsLower: string[]): string | null {
  const unique = [...new Set(streamsLower.map((s) => s.trim().toLowerCase()).filter(Boolean))].slice(
    0,
    MAX_BINANCE_STREAMS
  );
  if (!unique.length) return null;
  const q = unique.map((s) => `${s}@miniTicker`).join("/");
  return `${BINANCE_COMBINED}?streams=${q}`;
}

/** `BTC` → `btcusdt` (par spot USDT en Binance). */
export function toBinanceMiniStreamToken(fsymUpper: string): string {
  return `${fsymUpper.trim().toLowerCase()}usdt`;
}
