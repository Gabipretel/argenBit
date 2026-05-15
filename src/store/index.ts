import { configureStore } from "@reduxjs/toolkit";

import { filtersSlice } from "@/store/slices/filtersSlice";

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
