import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { enqueueAlertEvaluation } from "@/features/alerts";
import type { Asset } from "@/domain/models/Asset";
import type { AssetDetail } from "@/domain/models/AssetDetail";
import type { MarketsCoinsPage } from "@/features/markets";

/**
 * Actualiza precio en infinite top + detalle activo + favoritos (TanStack Query).
 */
export function patchPriceInQueryCaches(
  queryClient: QueryClient,
  fsymUpper: string,
  priceUsd: number
): void {
  queryClient.setQueriesData<InfiniteData<MarketsCoinsPage> | undefined>(
    { queryKey: ["topCoins"] },
    (old) => {
      if (!old?.pages?.length) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((a) =>
            a.fsym.toUpperCase() === fsymUpper ? { ...a, priceUsd } : a
          ),
        })),
      };
    }
  );

  queryClient.setQueryData<AssetDetail | undefined>(
    ["coin", fsymUpper],
    (prev) => {
      if (!prev) return prev;
      return { ...prev, priceUsd };
    }
  );

  queryClient.setQueriesData<Asset[]>(
    { queryKey: ["favorites", "prices"] },
    (old) => {
      if (!old?.length) return old;
      let touched = false;
      const next = old.map((a) => {
        if (a.fsym.toUpperCase() !== fsymUpper) return a;
        if (a.priceUsd === priceUsd) return a;
        touched = true;
        return { ...a, priceUsd };
      });
      return touched ? next : old;
    }
  );

  enqueueAlertEvaluation(queryClient, fsymUpper);
}
