import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { vehicleApi } from "@/features/vehicles/api";
import { dealerRequestApi } from "@/features/order/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [dealerRequestApi.reducerPath]: dealerRequestApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(vehicleApi.middleware)
      .concat(dealerRequestApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;