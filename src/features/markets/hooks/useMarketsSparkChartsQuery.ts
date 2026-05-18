import { useQuery } from "@tanstack/react-query";

import { chartUsdToSparkPoints } from "@/common/utils/chartSparkPoints";
import { DEFAULT_COIN_CHART_PERIOD } from "@/core/config/coinChartPeriods";
import { fetchCoinsCharts } from "@/core/api/repositories/chartsRepository";

/** Máximo de monedas por request. */
export const MARKETS_CHART_BATCH_SIZE = 12;

/** Mismo periodo que el gráfico por defecto en detalle de activo. */
export const MARKETS_LIST_CHART_PERIOD = DEFAULT_COIN_CHART_PERIOD;

export function marketsSparkChartsQueryKey(coinIds: string[]) {
  const sorted = [...new Set(coinIds.map((c) => c.trim()).filter(Boolean))].sort();
  return ["marketsSparkCharts", MARKETS_LIST_CHART_PERIOD, sorted] as const;
}

export type MarketsSparkChartsMap = Record<string, number[]>;

async function fetchMarketsSparkCharts(
  coinIds: string[]
): Promise<MarketsSparkChartsMap> {
  const batch = await fetchCoinsCharts(coinIds, MARKETS_LIST_CHART_PERIOD);
  const out: MarketsSparkChartsMap = {};
  for (const item of batch) {
    const points = chartUsdToSparkPoints(item.chart ?? []);
    if (points.length >= 2) out[item.coinId] = points;
  }
  return out;
}

/**
 * Sparklines (mismo periodo que el gráfico por defecto en detalle de activo) en Mercados (`GET /coins/charts`).
 */
export function useMarketsSparkChartsQuery(coinIds: string[], enabled = true) {
  const ids = [...new Set(coinIds.map((c) => c.trim()).filter(Boolean))].slice(
    0,
    MARKETS_CHART_BATCH_SIZE
  );

  return useQuery({
    queryKey: marketsSparkChartsQueryKey(ids),
    queryFn: () => fetchMarketsSparkCharts(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
