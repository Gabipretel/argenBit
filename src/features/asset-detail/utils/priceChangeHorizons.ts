import type { AssetDetail } from "@/domain/models/AssetDetail";
import type { PriceChangeHorizonPoint } from "@/domain/models/PriceChangeHorizon";

const HORIZONS: { label: string; key: keyof Pick<AssetDetail, "priceChange1h" | "priceChange1d" | "priceChange1w" | "priceChange1m"> }[] = [
  { label: "1 h", key: "priceChange1h" },
  { label: "24 h", key: "priceChange1d" },
  { label: "7 d", key: "priceChange1w" },
  { label: "1 m", key: "priceChange1m" },
];

export function priceChangeHorizonsFromDetail(detail: AssetDetail): PriceChangeHorizonPoint[] {
  return HORIZONS.map((h, idx) => ({
    idx,
    label: h.label,
    changePct: detail[h.key],
  }));
}
