import { useQuery } from "@tanstack/react-query";

import type { HistodayResponseDTO } from "@/api/dto/histoday";
import { cryptocompareClient } from "@/api/cryptocompareClient";
import {
  candlesToChartPoints,
  extractHistodayCandles,
} from "@/api/mappers/mapHistodayToChartPoints";
import type { HistoryRangeId, PriceHistoryPoint } from "@/domain/models/AssetDetail";

type HistoPath = "histominute" | "histohour" | "histoday";

const RANGE_CONFIG: Record<
  HistoryRangeId,
  { path: HistoPath; limit: number }
> = {
  "1h": { path: "histominute", limit: 60 },
  "24h": { path: "histohour", limit: 24 },
  "7d": { path: "histoday", limit: 7 },
  "6m": { path: "histoday", limit: 184 },
  "1y": { path: "histoday", limit: 365 },
  all: { path: "histoday", limit: 2000 },
};

async function fetchHistory(
  fsymUpper: string,
  range: HistoryRangeId
): Promise<PriceHistoryPoint[]> {
  const { path, limit } = RANGE_CONFIG[range];
  const { data } = await cryptocompareClient.get<HistodayResponseDTO>(
    `/data/v2/${path}`,
    {
      params: {
        fsym: fsymUpper,
        tsym: "USD",
        limit,
      },
    }
  );
  if (String(data.Response ?? "").toLowerCase() !== "success") {
    throw new Error("No se pudo cargar el histórico.");
  }
  const candles = extractHistodayCandles(data);
  return candlesToChartPoints(candles);
}

/**
 * Histórico de precio según intervalo (CryptoCompare v2).
 */
export function useAssetHistoryQuery(fsym: string, range: HistoryRangeId) {
  const upper = fsym.trim().toUpperCase();

  return useQuery({
    queryKey: ["coin", upper, "history", range] as const,
    queryFn: () => fetchHistory(upper, range),
    enabled: upper.length > 0,
  });
}
