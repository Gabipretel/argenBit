import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import type { TopMktCapFullResponseDTO } from "@/api/dto/topMktCapFull";
import { mapTopCoinEntryToAsset } from "@/api/mappers/mapTopCoinEntryToAsset";
import type { AssetDetail } from "@/domain/models/AssetDetail";
import type { PriceMetrics } from "@/alerts/alertConditions";
import type { Asset } from "@/domain/models/Asset";

function metricsFromTopPages(
  topData: InfiniteData<TopMktCapFullResponseDTO>,
  fsymUpper: string
): PriceMetrics | null {
  if (!topData.pages?.length) return null;
  let offset = 0;
  for (let p = 0; p < topData.pages.length; p++) {
    const batch = topData.pages[p].Data ?? [];
    for (let i = 0; i < batch.length; i++) {
      const entry = batch[i];
      const internal = entry.CoinInfo?.Internal?.toUpperCase();
      if (internal === fsymUpper) {
        const asset = mapTopCoinEntryToAsset(entry, offset + i + 1);
        return {
          priceUsd: asset.priceUsd,
          changePercent24Hr: asset.changePercent24Hr,
        };
      }
    }
    offset += batch.length;
  }
  return null;
}

/**
 * Snapshot para evaluar alertas: prioriza detalle, luego cualquier lista top en caché, luego favoritos.
 */
export function getPriceMetricsFromCache(
  queryClient: QueryClient,
  fsymUpper: string
): PriceMetrics | null {
  const detail = queryClient.getQueryData<AssetDetail>(["coin", fsymUpper]);
  if (detail) {
    return {
      priceUsd: detail.priceUsd,
      changePercent24Hr: detail.changePercent24Hr,
    };
  }

  const tops = queryClient.getQueriesData<InfiniteData<TopMktCapFullResponseDTO>>({
    queryKey: ["topCoins"],
  });
  for (const [, topData] of tops) {
    if (!topData) continue;
    const hit = metricsFromTopPages(topData, fsymUpper);
    if (hit) return hit;
  }

  const favRows = queryClient.getQueriesData<Asset[]>({
    queryKey: ["favorites", "prices"],
  });
  for (const [, data] of favRows) {
    if (!data?.length) continue;
    const hit = data.find((a) => a.fsym.toUpperCase() === fsymUpper);
    if (hit) {
      return {
        priceUsd: hit.priceUsd,
        changePercent24Hr: hit.changePercent24Hr,
      };
    }
  }

  return null;
}
