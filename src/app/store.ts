import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { vehicleApi } from "@/features/vehicles/api";
import { orderApi } from "@/features/order/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(vehicleApi.middleware)
      .concat(orderApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;