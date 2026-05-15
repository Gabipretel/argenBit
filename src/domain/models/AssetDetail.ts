/** Snapshot detalle — `/data/pricemultifull` + métricas RAW.USD */
export interface AssetDetail {
  fsym: string;
  name: string;
  symbolDisplay: string;
  priceUsd: number;
  changePercent24Hr: number;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  imageUrl: string | null;
}

export interface PriceHistoryPoint {
  idx: number;
  price: number;
  timeSec: number;
}

export type HistoryRangeId = "1h" | "24h" | "7d" | "6m" | "1y" | "all";
