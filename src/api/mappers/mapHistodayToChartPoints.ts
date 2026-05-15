import type { HistodayResponseDTO } from "@/api/dto/histoday";
import type { PriceHistoryPoint } from "@/domain/models/AssetDetail";

export function extractHistodayCandles(body: HistodayResponseDTO) {
  const inner = body.Data;
  if (!inner?.Data || !Array.isArray(inner.Data)) return [];
  return inner.Data;
}

export function candlesToChartPoints(
  candles: { time: number; close: number }[]
): PriceHistoryPoint[] {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  return sorted.map((c, idx) => ({
    idx,
    price: c.close,
    timeSec: c.time,
  }));
}
