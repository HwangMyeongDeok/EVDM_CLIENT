import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { vehicleApi } from "@/features/vehicles/api";
import { dealerRequestApi } from "@/features/order/api";
import { customerApi } from "@/features/customers/api";
import { dealerVehicleAllocationApi } from "@/features/allocation/api";
import { userApi } from "@/features/admin/api";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [dealerRequestApi.reducerPath]: dealerRequestApi.reducer,
    [dealerVehicleAllocationApi.reducerPath]: dealerVehicleAllocationApi.reducer,
    [userApi.reducerPath]: userApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(vehicleApi.middleware)
      .concat(dealerRequestApi.middleware)
      .concat(customerApi.middleware)
      .concat(dealerVehicleAllocationApi.middleware)
      .concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;