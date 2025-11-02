import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { vehicleApi } from "@/features/vehicles/api";
import { dealerRequestApi } from "@/features/order/api";
import { customerApi } from "@/features/customers/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [dealerRequestApi.reducerPath]: dealerRequestApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(vehicleApi.middleware)
      .concat(dealerRequestApi.middleware)
      .concat(customerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;