import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Order"],
  keepUnusedDataFor: 60,

  endpoints: (builder) => ({
    getOrders: builder.query<DealerVehicleRequest[], void>({
      query: () => ({ url: "/orders", method: "GET" }),
      transformResponse: (response: {
        success: boolean;
        count?: number;
        data: DealerVehicleRequest[];
      }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ request_id }) => ({
                type: "Order" as const,
                id: request_id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    getOrderById: builder.query<DealerVehicleRequest, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    createOrder: builder.mutation<
      DealerVehicleRequest,
      Partial<DealerVehicleRequest>
    >({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    updateOrderStatus: builder.mutation<
      DealerVehicleRequest,
      { id: string; status: "APPROVED" | "REJECTED" | "PARTIAL" }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    deleteOrder: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
