import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { enqueueAlertEvaluation } from "@/features/alerts/runAlertEvaluation";
import { ensureAsset } from "@/core/api/mappers/mapCoinToAsset";
import type { Asset } from "@/domain/models/Asset";
import { ensureAssetDetail } from "@/core/api/mappers/mapCoinToAssetDetail";
import type { AssetDetail } from "@/domain/models/AssetDetail";
import type { MarketsCoinsPage } from "@/features/markets/hooks/useTopCoinsInfiniteQuery";

/**
 * Actualiza precio (y opcionalmente variación 24 h) en infinite top + detalle + favoritos.
 * `changePercent24Hr` viene del stream Binance (ventana 24 h rodante); si se omite, no se toca el % de CoinStats.
 */
export function patchPriceInQueryCaches(
  queryClient: QueryClient,
  fsymUpper: string,
  priceUsd: number,
  changePercent24Hr?: number
): void {
  const sym = fsymUpper.trim().toUpperCase();
  const patchChange = changePercent24Hr !== undefined;

  queryClient.setQueriesData<InfiniteData<MarketsCoinsPage> | undefined>(
    { queryKey: ["topCoins"] },
    (old) => {
      if (!old?.pages?.length) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((a) => {
            if (a.fsym.toUpperCase() !== sym) return a;
            return ensureAsset(
              patchChange
                ? { ...a, priceUsd, changePercent24Hr }
                : { ...a, priceUsd }
            );
          }),
        })),
      };
    }
  );

  queryClient.setQueryData<AssetDetail | undefined>(
    ["coin", sym],
    (prev) => {
      if (!prev) return prev;
      return ensureAssetDetail(
        patchChange
          ? { ...prev, priceUsd, priceChange1d: changePercent24Hr }
          : { ...prev, priceUsd }
      );
    }
  );

  queryClient.setQueriesData<Asset[]>(
    { queryKey: ["favorites", "prices"] },
    (old) => {
      if (!old?.length) return old;
      let touched = false;
      const next = old.map((a) => {
        if (a.fsym.toUpperCase() !== sym) return a;
        const samePrice = a.priceUsd === priceUsd;
        const sameChange =
          !patchChange || a.changePercent24Hr === changePercent24Hr;
        if (samePrice && sameChange) return a;
        touched = true;
        return ensureAsset(
          patchChange
            ? { ...a, priceUsd, changePercent24Hr }
            : { ...a, priceUsd }
        );
      });
      return touched ? next : old;
    }
  );

  enqueueAlertEvaluation(queryClient, sym);
}
