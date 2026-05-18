import type { CoinChartPeriod, CoinChartPointDto } from "@/core/api/dto/coinChart";

const MAX_SPARK_POINTS = 32;

/**
 * Normaliza precios USD del chart CoinStats a serie 0–1 para `MiniSparkline`.
 */
export function chartUsdToSparkPoints(
  chart: CoinChartPointDto[],
  maxPoints = MAX_SPARK_POINTS
): number[] {
  const prices = chart
    .map((row) => row[1])
    .filter((p): p is number => typeof p === "number" && Number.isFinite(p) && p > 0);
  if (prices.length < 2) return [];

  const sampled =
    prices.length <= maxPoints
      ? prices
      : sampleEvenly(prices, maxPoints);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  return sampled.map((p) => Math.max(0.06, Math.min(0.94, (p - min) / range)));
}

/** Variación % entre primer y último precio USD del histórico. */
export function changePctFromChart(chart: CoinChartPointDto[]): number | null {
  const prices = chart
    .map((row) => row[1])
    .filter((p): p is number => typeof p === "number" && Number.isFinite(p) && p > 0);
  if (prices.length < 2) return null;
  const first = prices[0]!;
  const last = prices[prices.length - 1]!;
  if (first === 0) return null;
  return ((last - first) / first) * 100;
}

function sampleEvenly(values: number[], target: number): number[] {
  if (values.length <= target) return values;
  const out: number[] = [];
  const last = values.length - 1;
  for (let i = 0; i < target; i++) {
    const idx = Math.round((i / Math.max(1, target - 1)) * last);
    out.push(values[idx]!);
  }
  return out;
}
