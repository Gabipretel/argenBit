import { useQuery } from "@tanstack/react-query";

import { fetchCoinChart } from "@/core/api/repositories/coinsRepository";
import type { HistoryRangeId, PriceHistoryPoint } from "@/domain/models/AssetDetail";

const RANGE_TO_PERIOD: Record<HistoryRangeId, string> = {
  "24h": "24h",
  "7d": "1w",
  "6m": "6m",
  "1y": "1y",
  all: "all",
};

function chartRowsToPoints(rows: number[][]): PriceHistoryPoint[] {
  return rows.map((row, idx) => ({
    idx,
    timeSec: typeof row[0] === "number" ? row[0] : 0,
    price: typeof row[1] === "number" ? row[1] : 0,
  }));
}

async function fetchHistory(
  coinId: string,
  range: HistoryRangeId
): Promise<PriceHistoryPoint[]> {
  const period = RANGE_TO_PERIOD[range];
  const rows = await fetchCoinChart(coinId, period);
  const pts = chartRowsToPoints(rows);
  if (!pts.length) {
    throw new Error("No se pudo cargar el histórico.");
  }
  return pts;
}

/**
 * Histórico de precio (CoinStats charts).
 */
export function useAssetHistoryQuery(
  coinId: string,
  range: HistoryRangeId
) {
  const id = coinId.trim();

  return useQuery({
    queryKey: ["coin", "history", id, range] as const,
    queryFn: () => fetchHistory(id, range),
    enabled: id.length > 0,
  });
}
