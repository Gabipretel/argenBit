
export type CoinChartPointDto = [number, number, number, number];

export type CoinChartPeriod =
  | "all"
  | "24h"
  | "1w"
  | "1m"
  | "3m"
  | "6m"
  | "1y";

export type CoinChartByIdResponseDto = CoinChartPointDto[];

export type CoinChartsBatchItemDto = {
  coinId: string;
  chart: CoinChartPointDto[];
  errorMessage?: string;
};

export type CoinChartsBatchResponseDto = CoinChartsBatchItemDto[];
