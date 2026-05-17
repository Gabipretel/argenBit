/** Modelo de dominio — lista Mercados / favoritos / alertas. */
export interface Asset {
  /** Identificador CoinStats (`/coins` → `id`). */
  coinId: string;
  rank: number;
  fsym: string;
  name: string;
  symbolDisplay: string;
  priceUsd: number;
  changePercent24Hr: number;
  marketCapUsd: number | null;
  /** Volumen 24h en USD según CoinStats, si el listado lo incluye. */
  volume24hUsd: number | null;
  /** Supply circulante (`availableSupply` en CoinStats). */
  circulatingSupply: number | null;
  /** Puntajes CoinStats (0–100), listado con `includeRiskScore=true`. */
  riskScore: number | null;
  volatilityScore: number | null;
  liquidityScore: number | null;
  imageUrl: string | null;
}
