import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';
import type { IUser } from '@/types/user'; // Import IUser từ types/user

interface CreateUserDto {
  email: string;
  password: string;
  role: string; // UserRole enum value
  full_name: string;
  phone?: string;
  dealer_id?: number | null; 
}

interface UpdateUserDto {
  full_name?: string;
  phone?: string;
  role?: string; 
  dealer_id?: number | null; 
  password?: string; // Tùy chọn, chỉ khi thay đổi
}
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    // Lấy danh sách tất cả người dùng (Admin role)
    getUsers: builder.query<IUser[], void>({
      query: () => ({ url: '/users' }), // <--- ĐÚNG như yêu cầu của bạn: instance.get('/users')
      transformResponse: (response: { success: boolean; count: number; data: IUser[] }) => response.data,
      providesTags: ['User'],
    }),


    createUser: builder.mutation<IUser, CreateUserDto>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: IUser }) => response.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }], // Làm mới danh sách
    }),

    // 3. Xóa người dùng (DELETE /users/:id)
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<IUser, { id: number; body: UpdateUserDto }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PATCH', // Dùng PATCH cho cập nhật một phần
        body,
      }),
      transformResponse: (response: { success: boolean; data: IUser }) => response.data,
      // Invalidates tags cho người dùng cụ thể và danh sách
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }], 
    })
    // Các endpoints khác cho Create, Update, Delete có thể được thêm sau
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = userApi;