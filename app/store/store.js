import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // নেক্সট-জেএস ট্র্যাকিং বাফারিং ফিক্স করতে
    }),
});