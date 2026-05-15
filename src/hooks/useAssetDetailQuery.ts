import { useQuery } from "@tanstack/react-query";

import type { PricemultifullResponseDTO } from "@/api/dto/pricemultifull";
import { cryptocompareClient } from "@/api/cryptocompareClient";
import { mapPricemultifullToAssetDetail } from "@/api/mappers/mapPricemultifullToAssetDetail";
import type { AssetDetail } from "@/domain/models/AssetDetail";

async function fetchDetail(
  fsymUpper: string,
  fallbackName?: string
): Promise<AssetDetail> {
  const { data } = await cryptocompareClient.get<PricemultifullResponseDTO>(
    "/data/pricemultifull",
    {
      params: {
        fsyms: fsymUpper,
        tsyms: "USD",
      },
    }
  );
  const asset = mapPricemultifullToAssetDetail(data, fsymUpper, fallbackName);
  if (!asset) {
    throw new Error("No hay datos de mercado para este activo.");
  }
  return asset;
}

/**
 * §8 — query key `['coin', fsym]`
 */
export function useAssetDetailQuery(fsym: string, displayName?: string) {
  const upper = fsym.trim().toUpperCase();

  return useQuery({
    queryKey: ["coin", upper] as const,
    queryFn: () => fetchDetail(upper, displayName),
    enabled: upper.length > 0,
  });
}
