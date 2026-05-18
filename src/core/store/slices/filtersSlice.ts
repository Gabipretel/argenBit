import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type MarketPreset = "price" | "volume" | "cap100" | "supply";

export type MarketDataFeedKind = "mcap" | "volume";

export function dataFeedForPreset(preset: MarketPreset): MarketDataFeedKind {
  return preset === "volume" ? "volume" : "mcap";
}

export type MarketChangeFilter = "all" | "gainers" | "losers";

export interface FiltersState {
  searchTerm: string;
  marketPreset: MarketPreset;
  changeFilter: MarketChangeFilter;
}

const initialState: FiltersState = {
  searchTerm: "",
  marketPreset: "cap100",
  changeFilter: "all",
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
    setChangeFilter(state, action: PayloadAction<MarketChangeFilter>) {
      state.changeFilter = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = "";
    },
  },
});

export const { setSearchTerm, setMarketPreset, setChangeFilter, resetFilters } =
  filtersSlice.actions;
