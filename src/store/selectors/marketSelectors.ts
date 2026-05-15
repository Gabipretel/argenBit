import { createSelector } from "@reduxjs/toolkit";

import type { Asset } from "@/domain/models/Asset";
import type { MarketPreset } from "@/store/slices/filtersSlice";
import type { RootState } from "@/store";

const PRICE_MIN = 100;
const PRICE_MAX = 5000;

function applyPreset(rows: Asset[], preset: MarketPreset): Asset[] {
  if (preset === "price") {
    return rows.filter((a) => a.priceUsd >= PRICE_MIN && a.priceUsd <= PRICE_MAX);
  }
  return rows;
}

function sortForPreset(rows: Asset[], preset: MarketPreset): Asset[] {
  const out = [...rows];
  switch (preset) {
    case "price":
      out.sort((a, b) => b.priceUsd - a.priceUsd);
      break;
    case "volume":
      out.sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0));
      break;
    case "cap100":
      out.sort((a, b) => {
        const ma = a.marketCapUsd ?? -1;
        const mb = b.marketCapUsd ?? -1;
        return mb - ma;
      });
      break;
    case "rank50":
      out.sort((a, b) => a.rank - b.rank);
      break;
    default:
      break;
  }
  return out;
}

export const selectFilteredMarketAssets = createSelector(
  [
    (_state: RootState, assets: Asset[]) => assets,
    (state: RootState) => state.filters.marketPreset,
    (state: RootState) => state.filters.searchTerm,
  ],
  (assets, marketPreset, searchTerm) => {
    let rows = [...assets];
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.symbolDisplay.toLowerCase().includes(q) ||
          a.fsym.toLowerCase().includes(q)
      );
    }
    rows = applyPreset(rows, marketPreset);
    return sortForPreset(rows, marketPreset);
  }
);
