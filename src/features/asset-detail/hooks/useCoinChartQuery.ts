import { useQuery } from "@tanstack/react-query";

import {
  changePctFromChart,
  chartUsdToSparkPoints,
} from "@/common/utils/chartSparkPoints";
import type { CoinChartPeriod } from "@/core/api/dto/coinChart";
import { fetchCoinChartById } from "@/core/api/repositories/chartsRepository";

export type CoinChartData = {
  sparkPoints: number[];
  changePct: number;
};

export function coinChartQueryKey(coinId: string, period: CoinChartPeriod) {
  return ["coinChart", coinId.trim(), period] as const;
}

async function fetchCoinChartData(
  coinId: string,
  period: CoinChartPeriod
): Promise<CoinChartData> {
  const chart = await fetchCoinChartById(coinId, period);
  const sparkPoints = chartUsdToSparkPoints(chart);
  const changePct = changePctFromChart(chart) ?? 0;
  return { sparkPoints, changePct };
}

/**
 * Histórico USD para gráfico en detalle (`GET /coins/{coinId}/charts`).
 */
export function useCoinChartQuery(
  coinId: string,
  period: CoinChartPeriod,
  enabled = true
) {
  const id = coinId.trim();

  return useQuery({
    queryKey: coinChartQueryKey(id, period),
    queryFn: () => fetchCoinChartData(id, period),
    enabled: enabled && id.length > 0,
    staleTime: 3 * 60_000,
    gcTime: 10 * 60_000,
  });
}
