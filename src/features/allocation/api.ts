import { createApi } from '@reduxjs/toolkit/query/react';
import type { DealerVehicleAllocation } from '@/types/dealer_vehicle_allocation';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';

export const dealerVehicleAllocationApi = createApi({
  reducerPath: 'dealerVehicleAllocationApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['DealerVehicleAllocation'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getDealerVehicleAllocations: builder.query<DealerVehicleAllocation[], { request_id?: string }>({
      query: (params) => ({ url: '/dealer-allocations', params }),
      transformResponse: (response: { success: boolean; count: number; data: DealerVehicleAllocation[] }) => response.data,
      providesTags: ['DealerVehicleAllocation'],
    }),
    getDealerVehicleAllocationById: builder.query<DealerVehicleAllocation, string>({
      query: (id) => ({ url: `/dealer-allocations/${id}` }),
      transformResponse: (response: { success: boolean; data: DealerVehicleAllocation }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'DealerVehicleAllocation', id }],
    }),
    createDealerVehicleAllocation: builder.mutation<DealerVehicleAllocation, Partial<DealerVehicleAllocation>>({
      query: (body) => ({
        url: '/dealer-allocations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: DealerVehicleAllocation }) => response.data,
      invalidatesTags: ['DealerVehicleAllocation'],
    }),
    updateDealerVehicleAllocation: builder.mutation<DealerVehicleAllocation, { id: string; body: Partial<DealerVehicleAllocation> }>({
      query: ({ id, body }) => ({
        url: `/dealer-allocations/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { success: boolean; data: DealerVehicleAllocation }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DealerVehicleAllocation', id }],
    }),
    deleteDealerVehicleAllocation: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/dealer-allocations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'DealerVehicleAllocation', id }],
    }),
  }),
});

export const {
  useGetDealerVehicleAllocationsQuery,
  useGetDealerVehicleAllocationByIdQuery,
  useCreateDealerVehicleAllocationMutation,
  useUpdateDealerVehicleAllocationMutation,
  useDeleteDealerVehicleAllocationMutation,
} = dealerVehicleAllocationApi;