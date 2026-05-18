import { configureStore } from "@reduxjs/toolkit";

import {
  filtersSlice,
  resetFilters,
  setChangeFilter,
  setMarketPreset,
  setSearchTerm,
} from "@/core/store/slices/filtersSlice";

describe("filtersSlice", () => {
  it("setSearchTerm actualiza el término", () => {
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setSearchTerm("btc"));
    expect(store.getState().filters.searchTerm).toBe("btc");
  });

  it("setMarketPreset cambia el filtro de mercado", () => {
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setMarketPreset("volume"));
    expect(store.getState().filters.marketPreset).toBe("volume");
  });

  it("setChangeFilter actualiza filtro de variación", () => {
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setChangeFilter("gainers"));
    expect(store.getState().filters.changeFilter).toBe("gainers");
  });

  it("resetFilters solo limpia búsqueda", () => {
    const store = configureStore({ reducer: { filters: filtersSlice.reducer } });
    store.dispatch(setMarketPreset("cap100"));
    store.dispatch(setSearchTerm("eth"));
    store.dispatch(resetFilters());
    expect(store.getState().filters.marketPreset).toBe("cap100");
    expect(store.getState().filters.searchTerm).toBe("");
  });
});
