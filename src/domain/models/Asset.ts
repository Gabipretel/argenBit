/** Modelo de dominio — lista Mercados / favoritos / alertas. */
export interface Asset {
  rank: number;
  fsym: string;
  name: string;
  symbolDisplay: string;
  priceUsd: number;
  changePercent24Hr: number;
  marketCapUsd: number | null;
  /** Volumen 24h en USD (CryptoCompare RAW.USD), si viene en el feed. */
  volume24hUsd: number | null;
  imageUrl: string | null;
}
