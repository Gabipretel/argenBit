import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Vista de mercado — cuadrícula 2×2 (define filtro + fuente de datos). */
export type MarketPreset = "price" | "volume" | "cap100" | "supply";

/** Orden del listado CoinStats: `mcap` (precio, cap, ranking) o `volume` (preset volumen). */
export type MarketDataFeedKind = "mcap" | "volume";

export function dataFeedForPreset(preset: MarketPreset): MarketDataFeedKind {
  return preset === "volume" ? "volume" : "mcap";
}

export interface FiltersState {
  searchTerm: string;
  marketPreset: MarketPreset;
}

const initialState: FiltersState = {
  searchTerm: "",
  marketPreset: "cap100",
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setMarketPreset(state, action: PayloadAction<MarketPreset>) {
      state.marketPreset = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = "";
    },
  },
});

export const { setSearchTerm, setMarketPreset, resetFilters } = filtersSlice.actions;
