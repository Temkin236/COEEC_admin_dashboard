import { api } from './baseApi'
import { ContactItem } from '@/types/content.types'

export const contactApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getContacts: builder.query<{ items: ContactItem[]; total: number }, { page?: number; limit?: number; status?: string }>({
            async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
                const { page = 1, limit = 10, status } = args
                const params = status ? `?page=${page}&limit=${limit}&status=${status}` : `?page=${page}&limit=${limit}`
                const result = await fetchWithBQ(`/contact${params}`)

                if (result.error) {
                    const items: ContactItem[] = [
                        { id: 1, name: "John Doe", email: "john@example.com", subject: "Inquiry about admission", message: "I would like to know more about the admission process...", status: "new", createdAt: new Date().toISOString() },
                    ]
                    return { data: { items, total: items.length } }
                }

                return { data: result.data as { items: ContactItem[]; total: number } }
            },
            providesTags: ['Contact'],
        }),
        updateContactStatus: builder.mutation<ContactItem, { id: number; status: string }>({
            async queryFn({ id, status }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({
                        url: `/contact/${id}/status`,
                        method: 'PATCH',
                        body: { status }
                    })
                    if (result.error) throw result.error
                    return { data: result.data as ContactItem }
                } catch (e) {
                    return { data: { id, status } as unknown as ContactItem }
                }
            },
            invalidatesTags: ['Contact'],
        }),
    }),
})

export const { useGetContactsQuery, useUpdateContactStatusMutation } = contactApi
