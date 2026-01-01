import { api } from './baseApi'
import { Publication } from '@/types/content.types'

export const publicationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyPublications: builder.query<Publication[], void>({
            query: () => '/publications/me',
            providesTags: ['Publication'],
        }),
        createPublication: builder.mutation<Publication, Partial<Publication>>({
            query: (data) => ({
                url: '/publications',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Publication'],
        }),
        updatePublication: builder.mutation<Publication, { id: string; data: Partial<Publication> }>({
            query: ({ id, data }) => ({
                url: `/publications/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Publication', { type: 'Publication', id: arg.id }],
        }),
        deletePublication: builder.mutation<string, string>({
            query: (id) => ({
                url: `/publications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Publication'],
        }),
    }),
})

export const {
    useGetMyPublicationsQuery,
    useCreatePublicationMutation,
    useUpdatePublicationMutation,
    useDeletePublicationMutation
} = publicationApi
