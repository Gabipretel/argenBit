import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import type {
  TopCoinEntryDTO,
  TopMktCapFullResponseDTO,
} from "@/api/dto/topMktCapFull";
import { enqueueAlertEvaluation } from "@/alerts/runAlertEvaluation";
import type { Asset } from "@/domain/models/Asset";
import type { AssetDetail } from "@/domain/models/AssetDetail";

function patchEntryUsdPrice(
  entry: TopCoinEntryDTO,
  fsymUpper: string,
  priceUsd: number
): TopCoinEntryDTO {
  const internal = entry.CoinInfo?.Internal?.toUpperCase();
  if (internal !== fsymUpper) return entry;
  const prevUsd = (entry.RAW?.USD ?? {}) as Record<string, unknown>;
  return {
    ...entry,
    RAW: {
      ...entry.RAW,
      USD: {
        ...prevUsd,
        PRICE: priceUsd,
      },
    },
  };
}

/**
 * Actualiza precio en infinite top + detalle activo — §5 (sin Redux).
 */
export function patchPriceInQueryCaches(
  queryClient: QueryClient,
  fsymUpper: string,
  priceUsd: number
): void {
  queryClient.setQueriesData<InfiniteData<TopMktCapFullResponseDTO> | undefined>(
    { queryKey: ["topCoins"] },
    (old) => {
      if (!old?.pages?.length) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          Data: (page.Data ?? []).map((entry) =>
            patchEntryUsdPrice(entry, fsymUpper, priceUsd)
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
