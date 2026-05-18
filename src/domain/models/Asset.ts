/** Modelo para la lista Mercados / favoritos / alertas. */
export interface Asset {
  coinId: string;
  rank: number;
  fsym: string;
  name: string;
  symbolDisplay: string;
  priceUsd: number;
  /** Variación 1 h . */
  priceChange1h: number;
  /** Variación 24 h  */
  changePercent24Hr: number;
  marketCapUsd: number | null;
  /** Volumen 24h en USD. */
  volume24hUsd: number | null;
  /** Supply circulante. */
  circulatingSupply: number | null;
  /** Puntajes (0–100). */
  riskScore: number | null;
  volatilityScore: number | null;
  liquidityScore: number | null;
  imageUrl: string | null;
}
