import { createApi } from '@reduxjs/toolkit/query/react';
import type { IVehicle } from '@/types/vehicle';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';

export const vehicleApi = createApi({
  reducerPath: 'vehicleApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Vehicle'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getVehicles: builder.query<IVehicle[], void>({
      query: () => ({ url: '/vehicles' }),
      transformResponse: (response: { success: boolean; count: number; data: IVehicle[] }) => response.data,
      providesTags: ['Vehicle'],
    }),
    getVehicleById: builder.query<IVehicle, string>({
      query: (id) => ({ url: `/vehicles/${id}` }),
      transformResponse: (response: { success: boolean; data: IVehicle }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Vehicle', id }],
    }),
    createVehicle: builder.mutation<IVehicle, Partial<IVehicle>>({
      query: (body) => ({
        url: '/vehicles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: IVehicle }) => response.data,
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation<IVehicle, { id: string; body: Partial<IVehicle> }>({
      query: ({ id, body }) => ({
        url: `/vehicles/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { success: boolean; data: IVehicle }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vehicle', id }],
    }),
    deleteVehicle: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;
