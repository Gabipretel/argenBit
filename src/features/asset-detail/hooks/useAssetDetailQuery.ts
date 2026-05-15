import { useQuery } from "@tanstack/react-query";

import { mapCoinToAssetDetail } from "@/core/api/mappers/mapCoinToAssetDetail";
import { fetchCoinById } from "@/core/api/repositories/coinsRepository";
import type { AssetDetail } from "@/domain/models/AssetDetail";

async function fetchDetail(coinId: string, fallbackName?: string): Promise<AssetDetail> {
  const dto = await fetchCoinById(coinId);
  return mapCoinToAssetDetail(dto, fallbackName);
}

/**
 * Detalle por `coinId` (CoinStats). Query key `['coin', fsym]` para compatibilidad con parches WS.
 */
export function useAssetDetailQuery(
  fsym: string,
  coinId: string,
  displayName?: string
) {
  const upper = fsym.trim().toUpperCase();
  const id = coinId.trim();

  return useQuery({
    queryKey: ["coin", upper] as const,
    queryFn: () => fetchDetail(id, displayName),
    enabled: upper.length > 0 && id.length > 0,
  });
}
