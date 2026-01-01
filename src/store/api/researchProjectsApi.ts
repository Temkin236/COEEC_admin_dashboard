import { api } from './baseApi'
import { ResearchProject } from '@/types/content.types'

export const researchProjectsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getResearchProjects: builder.query<ResearchProject[], void>({
            query: () => '/research-projects?all=true',
            providesTags: ['ResearchProject'],
        }),
        createResearchProject: builder.mutation<ResearchProject, Partial<ResearchProject>>({
            query: (data) => ({
                url: '/research-projects',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ResearchProject'],
        }),
        updateResearchProject: builder.mutation<ResearchProject, { id: string; data: Partial<ResearchProject> }>({
            query: ({ id, data }) => ({
                url: `/research-projects/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['ResearchProject', { type: 'ResearchProject', id: arg.id }],
        }),
        deleteResearchProject: builder.mutation<string, string>({
            query: (id) => ({
                url: `/research-projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ResearchProject'],
        }),
        publishResearchProject: builder.mutation<ResearchProject, string>({
            query: (id) => ({
                url: `/research-projects/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => ['ResearchProject', { type: 'ResearchProject', id }],
        }),
    }),
})

export const {
    useGetResearchProjectsQuery,
    useCreateResearchProjectMutation,
    useUpdateResearchProjectMutation,
    useDeleteResearchProjectMutation,
    usePublishResearchProjectMutation
} = researchProjectsApi
