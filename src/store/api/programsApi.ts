import { api } from './baseApi'
import { Program } from '@/types/academic.types'

export const programsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPrograms: builder.query<Program[], void>({
            query: () => '/programs?all=true',
            providesTags: ['Program'],
        }),
        getProgramById: builder.query<Program, string | number>({
            query: (id) => `/programs/${id}`,
            providesTags: (result, error, id) => [{ type: 'Program', id }],
        }),
        createProgram: builder.mutation<Program, Partial<Program>>({
            query: (payload) => ({
                url: '/programs',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Program'],
        }),
        updateProgram: builder.mutation<Program, { id: string | number; data: Partial<Program> }>({
            query: ({ id, data }) => ({
                url: `/programs/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Program', { type: 'Program', id: arg.id }],
        }),
        deleteProgram: builder.mutation<string | number, string | number>({
            query: (id) => ({
                url: `/programs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Program'],
        }),
        publishProgram: builder.mutation<Program, string | number>({
            query: (id) => ({
                url: `/programs/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => ['Program', { type: 'Program', id }],
        }),
    }),
})

export const {
    useGetProgramsQuery,
    useGetProgramByIdQuery,
    useCreateProgramMutation,
    useUpdateProgramMutation,
    useDeleteProgramMutation,
    usePublishProgramMutation
} = programsApi
