/** Snapshot detalle — CoinStats `GET /coins/{coinId}` */
export interface AssetDetail {
  coinId: string;
  fsym: string;
  name: string;
  symbolDisplay: string;
  priceUsd: number;
  /** Variación % según CoinStats (`priceChange*` del DTO). */
  priceChange1h: number;
  priceChange1d: number;
  priceChange1w: number;
  priceChange1m: number;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  imageUrl: string | null;
}
