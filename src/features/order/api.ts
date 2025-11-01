import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";

export const dealerRequestApi = createApi({
  reducerPath: "dealerRequestApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["DealerRequest"],
  keepUnusedDataFor: 60,

  endpoints: (builder) => ({
    // Lấy danh sách yêu cầu
    getDealerRequests: builder.query<DealerVehicleRequest[], void>({
      query: () => ({ url: "/dealer-requests", method: "GET" }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest[];
      }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ request_id }) => ({
                type: "DealerRequest" as const,
                id: request_id,
              })),
              { type: "DealerRequest", id: "LIST" },
            ]
          : [{ type: "DealerRequest", id: "LIST" }],
    }),

    // Lấy yêu cầu theo ID
    getDealerRequestById: builder.query<DealerVehicleRequest, string>({
      query: (id) => ({ url: `/dealer-requests/${id}`, method: "GET" }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: "DealerRequest", id }],
    }),

    // Tạo yêu cầu mới
    createDealerRequest: builder.mutation<
      DealerVehicleRequest,
      Partial<DealerVehicleRequest>
    >({
      query: (body) => ({
        url: "/dealer-requests",
        method: "POST",
        body: body,
      }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      
      invalidatesTags: [{ type: "DealerRequest", id: "LIST" }],
    }),

    // Cập nhật trạng thái yêu cầu
    updateDealerRequestStatus: builder.mutation<
      DealerVehicleRequest,
      { id: string; status: "APPROVED" | "REJECTED" | "PARTIAL" }
    >({
      query: ({ id, status }) => ({
        url: `/dealer-requests/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      transformResponse: (response: {
        success: boolean;
        data: DealerVehicleRequest;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "DealerRequest", id },
        { type: "DealerRequest", id: "LIST" },
      ],
    }),

    // Xóa yêu cầu
    deleteDealerRequest: builder.mutation<{ success: boolean; id: string }, string>(
      {
        query: (id) => ({
          url: `/dealer-requests/${id}`,
          method: "DELETE",
        }),
        transformResponse: (response: { success: boolean; id: string }) => response,
        invalidatesTags: [{ type: "DealerRequest", id: "LIST" }],
      }
    ),
  }),
});

export const {
  useGetDealerRequestsQuery,
  useGetDealerRequestByIdQuery,
  useCreateDealerRequestMutation,
  useUpdateDealerRequestStatusMutation,
  useDeleteDealerRequestMutation,
} = dealerRequestApi;
