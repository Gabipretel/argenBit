import type { CoinChartPeriod } from "@/core/api/dto/coinChart";

/** Periodos CoinStats `GET /coins/{id}/charts?period=` — mismos valores que la API. */
export const COIN_CHART_PERIODS: ReadonlyArray<{
  period: CoinChartPeriod;
  label: string;
}> = [
  { period: "24h", label: "24 h" },
  { period: "1w", label: "1 sem" },
  { period: "1m", label: "1 mes" },
  { period: "3m", label: "3 meses" },
  { period: "6m", label: "6 meses" },
  { period: "1y", label: "1 año" },
  { period: "all", label: "Todo" },
] as const;

/** Sparkline en Mercados y chip inicial en detalle. */
export const DEFAULT_COIN_CHART_PERIOD: CoinChartPeriod = "24h";

export function coinChartPeriodLabel(period: CoinChartPeriod): string {
  return COIN_CHART_PERIODS.find((p) => p.period === period)?.label ?? period;
}
