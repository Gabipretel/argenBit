import type { CoinListItemDto, CoinListResponseDto } from "@/core/api/dto/coinList";
import { httpClient } from "@/core/api/http.client";
import type { MarketDataFeedKind } from "@/core/store/slices/filtersSlice";

const SORT_BY: Record<MarketDataFeedKind, string> = {
  mcap: "marketCap",
  volume: "volume",
};

export async function fetchCoinsPage(
  kind: MarketDataFeedKind,
  page: number,
  limit: number,
  currency = "USD"
): Promise<CoinListResponseDto> {
  const sortBy = SORT_BY[kind];
  const { data } = await httpClient.get<CoinListResponseDto>("/coins", {
    params: {
      page,
      limit,
      currency,
      sortBy,
      sortDir: "desc",
      includeRiskScore: true,
    },
  });
  return data;
}

export async function fetchCoinById(
  coinId: string,
  currency = "USD"
): Promise<CoinListItemDto> {
  const { data } = await httpClient.get<CoinListItemDto>(
    `/coins/${encodeURIComponent(coinId)}`,
    { params: { currency } }
  );
  return data;
}

export async function fetchCoinsByIds(
  coinIds: string[],
  currency = "USD"
): Promise<CoinListItemDto[]> {
  const ids = [...new Set(coinIds.map((c) => c.trim()).filter(Boolean))];
  if (!ids.length) return [];
  const { data } = await httpClient.get<CoinListResponseDto>("/coins", {
    params: {
      coinIds: ids.join(","),
      currency,
      limit: Math.min(ids.length, 250),
      includeRiskScore: true,
    },
  });
  return data.result ?? [];
}

export async function fetchCoinBySymbol(
  symbolUpper: string,
  currency = "USD"
): Promise<CoinListItemDto | null> {
  const sym = symbolUpper.trim().toUpperCase();
  if (!sym) return null;
  const { data } = await httpClient.get<CoinListResponseDto>("/coins", {
    params: { symbol: sym, currency, limit: 1, includeRiskScore: true },
  });
  return data.result?.[0] ?? null;
}

export async function fetchCoinChart(
  coinId: string,
  period: string
): Promise<number[][]> {
  const { data } = await httpClient.get<number[][]>(
    `/coins/${encodeURIComponent(coinId)}/charts`,
    { params: { period } }
  );
  return Array.isArray(data) ? data : [];
}
