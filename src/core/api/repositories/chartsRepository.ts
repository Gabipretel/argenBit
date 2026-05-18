import type {
  CoinChartByIdResponseDto,
  CoinChartPeriod,
  CoinChartsBatchResponseDto,
} from "@/core/api/dto/coinChart";
import { httpClient } from "@/core/api/http.client";

export async function fetchCoinChartById(
  coinId: string,
  period: CoinChartPeriod
): Promise<CoinChartByIdResponseDto> {
  const id = coinId.trim();
  const { data } = await httpClient.get<CoinChartByIdResponseDto>(
    `/coins/${encodeURIComponent(id)}/charts`,
    { params: { period } }
  );
  return data;
}

export async function fetchCoinsCharts(
  coinIds: string[],
  period: CoinChartPeriod
): Promise<CoinChartsBatchResponseDto> {
  const ids = [...new Set(coinIds.map((c) => c.trim()).filter(Boolean))];
  if (!ids.length) return [];
  const { data } = await httpClient.get<CoinChartsBatchResponseDto>("/coins/charts", {
    params: { period, coinIds: ids.join(",") },
  });
  return data;
}
