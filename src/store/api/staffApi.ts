import { api } from './baseApi'
import { StaffItem } from '@/types/staff.types'

export const staffApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStaff: builder.query<{ items: StaffItem[]; total: number; page?: number; limit?: number }, { page?: number; limit?: number; filters?: Record<string, any> }>({
            query: ({ page = 1, limit = 10, filters = {} }) => {
                const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters as any })
                return `/staff?${params.toString()}`
            },
            transformResponse: (response: any) => {
                if (Array.isArray(response)) {
                    return { items: response, total: response.length }
                }
                return response
            },
            providesTags: ['Staff'],
        }),
        getStaffById: builder.query<StaffItem, string>({
            query: (id) => `/staff/${id}`,
            providesTags: (result, error, id) => [{ type: 'Staff', id }],
        }),
        createStaff: builder.mutation<StaffItem, any>({
            query: (data) => {
                const payload = {
                    displayName: data.displayName,
                    title: data.title,
                    departmentId: data.departmentId,
                    email: data.email,
                    phone: data.phone,
                    officeLocation: data.officeLocation,
                    researchAreas: data.researchAreas || [],
                    biography: data.biography || {},
                    photoId: data.photoId,
                    cvId: data.cvId
                }
                return {
                    url: '/staff',
                    method: 'POST',
                    body: payload,
                }
            },
            invalidatesTags: ['Staff'],
        }),
        updateStaff: builder.mutation<StaffItem, { id: string; data: any }>({
            query: ({ id, data }) => {
                const payload = {
                    displayName: data.displayName,
                    title: data.title,
                    biography: data.biography || {},
                    researchAreas: data.researchAreas || [],
                    email: data.email,
                    phone: data.phone,
                    officeLocation: data.officeLocation
                }
                return {
                    url: `/staff/${id}`,
                    method: 'PUT',
                    body: payload,
                }
            },
            invalidatesTags: (result, error, arg) => ['Staff', { type: 'Staff', id: arg.id }],
        }),
        deleteStaff: builder.mutation<string, string>({
            query: (id) => ({
                url: `/staff/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Staff'],
        }),
        uploadCV: builder.mutation<{ id: string; cvUrl: string }, { id: string; file: File }>({
            async queryFn({ id, file }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const formData = new FormData()
                    formData.append("file", file)
                    const result = await fetchWithBQ({
                        url: `/staff/${id}/cv`,
                        method: 'POST',
                        body: formData,
                    })
                    if (result.error) throw result.error
                    return { data: result.data as { id: string; cvUrl: string } }
                } catch (e: any) {
                    return { error: e }
                }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Staff', id: arg.id }],
        }),
    }),
})

export const {
    useGetStaffQuery,
    useGetStaffByIdQuery,
    useCreateStaffMutation,
    useUpdateStaffMutation,
    useDeleteStaffMutation,
    useUploadCVMutation
} = staffApi
