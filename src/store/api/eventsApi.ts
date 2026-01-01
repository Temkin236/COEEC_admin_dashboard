import { api } from './baseApi'
import { Event } from '@/types/content.types'

export const eventsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPublicEvents: builder.query<Event[], void>({
            query: () => '/events/public',
            transformResponse: (response: any) => {
                // Handle { data: [...] } or [...]
                return (response?.data || response) as Event[]
            },
            providesTags: ['Event'], // Separate tag for public? Might be simpler to just share Event
        }),
        getEvents: builder.query<Event[], void>({
            query: () => '/events?all=true',
            transformResponse: (response: any) => {
                return (response?.data || response) as Event[]
            },
            providesTags: ['Event'],
        }),
        getEventById: builder.query<Event, string | number>({
            query: (id) => `/events/${id}`,
            providesTags: (result, error, id) => [{ type: 'Event', id }],
        }),
        createEvent: builder.mutation<Event, Partial<Event>>({
            query: (payload) => ({
                url: '/events',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Event'],
        }),
        updateEvent: builder.mutation<Event, { id: string | number; data: Partial<Event> }>({
            query: ({ id, data }) => ({
                url: `/events/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Event', { type: 'Event', id: arg.id }],
        }),
        deleteEvent: builder.mutation<string | number, string | number>({
            query: (id) => ({
                url: `/events/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Event'],
        }),
        publishEvent: builder.mutation<Event, string | number>({
            query: (id) => ({
                url: `/events/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => ['Event', { type: 'Event', id }],
        }),
    }),
})

export const {
    useGetPublicEventsQuery,
    useGetEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    usePublishEventMutation
} = eventsApi
