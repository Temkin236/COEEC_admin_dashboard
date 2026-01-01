import { api } from './baseApi'
import { User, InviteResponse } from '@/types/user.types'

export const usersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users',
            providesTags: ['User'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => `/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),
        createUser: builder.mutation<InviteResponse, { email: string; displayName: string; roleIds: string[] }>({
            query: (data) => ({
                url: '/users',
                method: 'POST',
                body: data,
            }),
            // Does not invalidate 'User' tag immediately because it returns an invite, not the user added to the list?
            // Assuming invite creation might eventually add a user or we just wait for them to accept.
            // But usually admins want to see the invited user in pending state.
            // Let's safe invalidate.
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['User', { type: 'User', id: arg.id }],
        }),
        deleteUser: builder.mutation<string, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
})

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} = usersApi
