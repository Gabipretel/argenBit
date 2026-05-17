import { configureStore } from "@reduxjs/toolkit";

import { filtersSlice, setMarketPreset } from "@/core/store/slices/filtersSlice";
import type { Asset } from "@/domain/models/Asset";

import { selectFilteredMarketAssets } from "./marketSelectors";

function asset(partial: Pick<Asset, "fsym" | "priceUsd" | "rank"> & Partial<Asset>): Asset {
  return {
    coinId: partial.coinId ?? partial.fsym.toLowerCase(),
    name: partial.name ?? partial.fsym,
    symbolDisplay: partial.symbolDisplay ?? partial.fsym,
    changePercent24Hr: partial.changePercent24Hr ?? 0,
    marketCapUsd: partial.marketCapUsd ?? null,
    volume24hUsd: partial.volume24hUsd ?? null,
    circulatingSupply: partial.circulatingSupply ?? null,
    riskScore: partial.riskScore ?? null,
    volatilityScore: partial.volatilityScore ?? null,
    liquidityScore: partial.liquidityScore ?? null,
    imageUrl: partial.imageUrl ?? null,
    ...partial,
  };
}

describe("selectFilteredMarketAssets", () => {
  const rows = [
    asset({ fsym: "ETH", priceUsd: 3_500, rank: 2 }),
    asset({ fsym: "BTC", priceUsd: 95_000, rank: 1 }),
    asset({ fsym: "DOGE", priceUsd: 0.2, rank: 10 }),
  ];

  it("preset price ordena por precio USD descendente sin excluir monedas caras", () => {
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setMarketPreset("price"));

    const sorted = selectFilteredMarketAssets(store.getState(), rows);
    expect(sorted.map((a) => a.fsym)).toEqual(["BTC", "ETH", "DOGE"]);
  });

  it("preset supply ordena por supply circulante descendente", () => {
    const rows = [
      asset({ fsym: "ETH", priceUsd: 1, circulatingSupply: 120_000_000 }),
      asset({ fsym: "BTC", priceUsd: 1, circulatingSupply: 19_800_000 }),
      asset({ fsym: "DOGE", priceUsd: 1, circulatingSupply: 140_000_000_000 }),
    ];
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setMarketPreset("supply"));

    expect(selectFilteredMarketAssets(store.getState(), rows).map((a) => a.fsym)).toEqual([
      "DOGE",
      "ETH",
      "BTC",
    ]);
  });
});
