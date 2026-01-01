import { api } from './baseApi'
import { Permission } from '@/types/user.types'

export const permissionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPermissions: builder.query<Permission[], void>({
            query: () => '/permissions',
            providesTags: ['Permission'],
        }),
        getPermissionById: builder.query<Permission, string>({
            query: (id) => `/permissions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Permission', id }],
        }),
    }),
})

export const { useGetPermissionsQuery, useGetPermissionByIdQuery } = permissionApi
