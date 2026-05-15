import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { mapCoinToAsset } from "@/core/api/mappers/mapCoinToAsset";
import {
  fetchCoinBySymbol,
  fetchCoinsByIds,
} from "@/core/api/repositories/coinsRepository";
import type { FavoriteEntry } from "@/storage/favoritesStorage";
import type { Asset } from "@/domain/models/Asset";

function orderByFavorites(assets: Asset[], order: FavoriteEntry[]): Asset[] {
  const byCoin = new Map(assets.map((a) => [a.coinId, a]));
  const bySym = new Map(assets.map((a) => [a.fsym.toUpperCase(), a]));
  const out: Asset[] = [];
  for (const e of order) {
    const hit =
      (e.coinId ? byCoin.get(e.coinId) : undefined) ?? bySym.get(e.fsym.toUpperCase());
    if (hit) out.push(hit);
  }
  return out;
}

async function loadFavoriteAssets(entries: FavoriteEntry[]): Promise<Asset[]> {
  const resolved: FavoriteEntry[] = [];
  for (const e of entries) {
    if (e.coinId.trim()) {
      resolved.push(e);
      continue;
    }
    const row = await fetchCoinBySymbol(e.fsym);
    if (row) resolved.push({ coinId: row.id, fsym: e.fsym });
  }
  const ids = resolved.map((r) => r.coinId).filter(Boolean);
  if (!ids.length) return [];
  const rows = await fetchCoinsByIds(ids);
  const assets = rows.map((row, i) => mapCoinToAsset(row, i + 1));
  return orderByFavorites(assets, entries);
}

export function useFavoriteAssetsQuery(entries: FavoriteEntry[]) {
  const key = useMemo(
    () =>
      entries
        .map((e) => `${e.coinId || "_"}:${e.fsym.toUpperCase()}`)
        .sort()
        .join("|"),
    [entries]
  );

  return useQuery({
    queryKey: ["favorites", "prices", key] as const,
    queryFn: () => loadFavoriteAssets(entries),
    enabled: entries.length > 0,
    staleTime: 30_000,
  });
}
