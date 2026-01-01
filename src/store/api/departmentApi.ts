import { api } from './baseApi'
import { Department } from '@/types/academic.types'

export const departmentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDepartments: builder.query<Department[], void>({
            query: () => '/departments',
            providesTags: ['Department'],
        }),
        getDepartmentById: builder.query<Department, string>({
            query: (id) => `/departments/${id}`,
            providesTags: (result, error, id) => [{ type: 'Department', id }],
        }),
        createDepartment: builder.mutation<Department, Partial<Department>>({
            query: (data) => ({
                url: '/departments',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Department'],
        }),
        updateDepartment: builder.mutation<Department, { id: string; data: Partial<Department> }>({
            query: ({ id, data }) => ({
                url: `/departments/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Department', { type: 'Department', id: arg.id }],
        }),
        deleteDepartment: builder.mutation<string, string>({
            query: (id) => ({
                url: `/departments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Department'],
        }),
    }),
})

export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation
} = departmentApi
