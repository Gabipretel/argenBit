import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { PricemultifullResponseDTO } from "@/api/dto/pricemultifull";
import { cryptocompareClient } from "@/api/cryptocompareClient";
import { mapPricemultifullToAssets } from "@/api/mappers/mapPricemultifullToAssets";

function orderedUniqueUpper(fsyms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of fsyms) {
    const u = s.trim().toUpperCase();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export function useFavoriteAssetsQuery(fsyms: string[]) {
  const ordered = useMemo(() => orderedUniqueUpper(fsyms), [fsyms]);
  const key = ordered.join(",");

  return useQuery({
    queryKey: ["favorites", "prices", key] as const,
    queryFn: async () => {
      if (!ordered.length) return [];
      const { data } = await cryptocompareClient.get<PricemultifullResponseDTO>(
        "/data/pricemultifull",
        {
          params: {
            fsyms: ordered.join(","),
            tsyms: "USD",
          },
        }
      );
      return mapPricemultifullToAssets(data, ordered);
    },
    enabled: ordered.length > 0,
    staleTime: 30_000,
  });
}
