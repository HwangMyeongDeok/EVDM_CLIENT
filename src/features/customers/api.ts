import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';
import type { ICustomer } from '@/types/customer';

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['customer'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getCustomers: builder.query<ICustomer[], void>({
      query: () => ({ url: '/customers' }),
      transformResponse: (response: { success: boolean; count: number; data: ICustomer[] }) => response.data,
      providesTags: ['customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
} = customerApi;
