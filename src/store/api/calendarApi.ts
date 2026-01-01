import { api } from './baseApi'
import { AcademicCalendar, CalendarEvent } from '@/types/academic.types'

export const calendarApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCalendars: builder.query<AcademicCalendar[], void>({
            query: () => '/academic-calendar?all=true',
            providesTags: ['Calendar'],
        }),
        getCalendarById: builder.query<AcademicCalendar, string | number>({
            query: (id) => `/academic-calendar/${id}`,
            providesTags: (result, error, id) => [{ type: 'Calendar', id }],
        }),
        createCalendar: builder.mutation<AcademicCalendar, Partial<AcademicCalendar>>({
            query: (payload) => ({
                url: '/academic-calendar',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Calendar'],
        }),
        updateCalendar: builder.mutation<AcademicCalendar, { id: string | number; data: Partial<AcademicCalendar> }>({
            query: ({ id, data }) => ({
                url: `/academic-calendar/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => ['Calendar', { type: 'Calendar', id: arg.id }],
        }),
        deleteCalendar: builder.mutation<string | number, string | number>({
            query: (id) => ({
                url: `/academic-calendar/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Calendar'],
        }),
        publishCalendar: builder.mutation<AcademicCalendar, string | number>({
            query: (id) => ({
                url: `/academic-calendar/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => ['Calendar', { type: 'Calendar', id }],
        }),
        addEventToCalendar: builder.mutation<CalendarEvent, { calendarId: string | number; event: Partial<CalendarEvent> }>({
            query: ({ calendarId, event }) => ({
                url: `/academic-calendar/${calendarId}/events`,
                method: 'POST',
                body: event,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Calendar', id: arg.calendarId }],
        }),
        updateCalendarEvent: builder.mutation<CalendarEvent, { eventId: string | number; data: Partial<CalendarEvent> }>({
            query: ({ eventId, data }) => ({
                url: `/academic-calendar/events/${eventId}`,
                method: 'PUT',
                body: data,
            }),
            // We might need to know which calendar this event belongs to in order to invalidate efficiently.
            // But typically invalidating the specific Calendar tag or a general Calendar tag is enough if the list view isn't showing full details.
            // For now, let's invalidate 'Calendar' generally as a safe default, or better, if the backend returns the whole calendar or we can guess.
            // Ideally the backend response would help, but let's just invalidate 'Calendar' list to be safe.
            invalidatesTags: ['Calendar'],
        }),
        deleteCalendarEvent: builder.mutation<string | number, string | number>({
            query: (eventId) => ({
                url: `/academic-calendar/events/${eventId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Calendar'],
        }),
    }),
})

export const {
    useGetCalendarsQuery,
    useGetCalendarByIdQuery,
    useCreateCalendarMutation,
    useUpdateCalendarMutation,
    useDeleteCalendarMutation,
    usePublishCalendarMutation,
    useAddEventToCalendarMutation,
    useUpdateCalendarEventMutation,
    useDeleteCalendarEventMutation
} = calendarApi
