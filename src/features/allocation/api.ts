import { createApi } from "@reduxjs/toolkit/query/react";
import type { DealerVehicleAllocation } from "@/types/dealer_vehicle_allocation";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const dealerVehicleAllocationApi = createApi({
  reducerPath: "dealerVehicleAllocationApi",
  baseQuery: axiosBaseQuery(),
  // 1. Định nghĩa 'tagTypes'
  tagTypes: ["DealerVehicleAllocation"],
  keepUnusedDataFor: 60,

  endpoints: (builder) => ({
    // 🟢 Lấy danh sách allocation theo request_id
    getDealerAllocations: builder.query<
  { success: boolean; data: DealerVehicleAllocation[] },
  { request_id: number }
>({
  query: ({ request_id }) => ({
    // ✅ Gọi đúng với backend route: /dealer-allocations/:request_id
    url: `/dealer-allocations/${request_id}`,
    method: "GET",
  }),
  // ✅ Giữ nguyên phần providesTags như cũ
  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map(({ allocation_id }) => ({
            type: "DealerVehicleAllocation" as const,
            id: allocation_id,
          })),
          { type: "DealerVehicleAllocation", id: "LIST" },
        ]
      : [{ type: "DealerVehicleAllocation", id: "LIST" }],
}),

    // 🟢 Lấy chi tiết 1 allocation
    getDealerAllocationById: builder.query<
      { success: boolean; data: DealerVehicleAllocation },
      number
    >({
      query: (id) => ({
        url: `/dealer-allocations/${id}`,
      }),
      providesTags: (_result, _error, id) => [
        { type: "DealerVehicleAllocation", id },
      ],
    }),

    // 🟢 Tạo mới allocation
    createDealerAllocation: builder.mutation<
      // ... (các kiểu dữ liệu giữ nguyên)
      any, any
    >({
      query: (body) => ({
        url: "/dealer-allocations",
        method: "POST",
        body,
      }),
      // 3. Vô hiệu hóa tag 'LIST' -> tự động gọi lại 'getDealerAllocations'
      invalidatesTags: [{ type: "DealerVehicleAllocation", id: "LIST" }],
    }),

    // 🟢 Cập nhật allocation
    updateDealerAllocation: builder.mutation<
      // ... (các kiểu dữ liệu giữ nguyên)
      any, { id: number; body: any }
    >({
      query: ({ id, body }) => ({
        url: `/dealer-allocations/${id}`,
        method: "PATCH",
        body,
      }),
      // 4. Vô hiệu hóa tag 'ID' -> tự động gọi lại 'getDealerAllocations'
      invalidatesTags: (_result, _error, { id }) => [
        { type: "DealerVehicleAllocation", id },
      ],
    }),

    // 🟢 Xóa allocation
    deleteDealerAllocation: builder.mutation<
      // ... (các kiểu dữ liệu giữ nguyên)
      any, number
    >({
      query: (id) => ({
        url: `/dealer-allocations/${id}`,
        method: "DELETE",
      }),
      // 5. Vô hiệu hóa tag 'ID' -> tự động gọi lại 'getDealerAllocations'
      invalidatesTags: (_result, _error, id) => [
        { type: "DealerVehicleAllocation", id },
      ],
    }),
  }),
});

export const {
  useGetDealerAllocationsQuery,
  useGetDealerAllocationByIdQuery,
  useCreateDealerAllocationMutation,
  useUpdateDealerAllocationMutation,
  useDeleteDealerAllocationMutation,
} = dealerVehicleAllocationApi;