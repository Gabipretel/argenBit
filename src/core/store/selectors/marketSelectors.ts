import { createSelector } from "@reduxjs/toolkit";

import type { Asset } from "@/domain/models/Asset";
import type { MarketPreset } from "@/core/store/slices/filtersSlice";
import type { RootState } from "@/core/store";

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
    case "supply":
      out.sort(
        (a, b) => (b.circulatingSupply ?? -1) - (a.circulatingSupply ?? -1)
      );
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
    return sortForPreset(rows, marketPreset);
  }
);
