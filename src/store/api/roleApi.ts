import { api } from './baseApi'
import { Role } from '@/types/user.types'

export const roleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getRoles: builder.query<Role[], void>({
            query: () => '/roles',
            providesTags: ['Role'],
        }),
        getRoleById: builder.query<Role, string>({
            query: (id) => `/roles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Role', id }],
        }),
        createRole: builder.mutation<Role, { name: string; description?: string; permissionIds: string[] }>({
            query: (data) => ({
                url: '/roles',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Role'],
        }),
        updateRole: builder.mutation<Role, { id: string; name: string; description?: string; permissionIds: string[] }>({
            query: ({ id, ...data }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Role', { type: 'Role', id: arg.id }],
        }),
        deleteRole: builder.mutation<string, string>({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Role'],
        }),
    }),
})

export const {
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation
} = roleApi
