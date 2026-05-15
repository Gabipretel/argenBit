import { env } from "@/config/env";

/** CCCAGG spot USD — canal legacy CryptoCompare streamer. */
export const STREAM_AGG_PREFIX = "5~CCCAGG";

/** Límite de suscripciones por conexión (evitar saturar). */
export const MAX_STREAMER_SYMBOLS = 80;

export function streamerWsUrl(): string | null {
  const key = env.cryptocompareApiKey.trim();
  if (!key) return null;
  return `wss://streamer.cryptocompare.com/v2?api_key=${encodeURIComponent(key)}`;
}

export function toAggSub(fsymUpper: string): string {
  return `${STREAM_AGG_PREFIX}~${fsymUpper}~USD`;
}
