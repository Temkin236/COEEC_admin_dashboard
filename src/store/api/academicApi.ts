import { api } from './baseApi'
import { Course } from '@/types/academic.types'

export const academicApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCoursesByProgram: builder.query<{ programId: string; courses: Course[] }, string | number>({
            query: (programId) => `/courses/programs/${programId}/courses?all=true`,
            transformResponse: (response: Course[], meta, arg) => {
                return { programId: String(arg), courses: response }
            },
            providesTags: (result, error, arg) =>
                result
                    ? [
                        ...result.courses.map(({ id }) => ({ type: 'Course' as const, id })),
                        { type: 'Course', id: `LIST_${arg}` }
                    ]
                    : [{ type: 'Course', id: `LIST_${arg}` }],
        }),
        getCourseById: builder.query<Course, string | number>({
            query: (id) => `/courses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        createCourse: builder.mutation<{ programId: string; course: Course }, { programId: string | number; payload: Partial<Course> }>({
            query: ({ programId, payload }) => ({
                url: `/courses/programs/${programId}/courses`,
                method: 'POST',
                body: payload,
            }),
            transformResponse: (response: Course, meta, arg) => {
                return { programId: String(arg.programId), course: response }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Course', id: `LIST_${arg.programId}` }],
        }),
        updateCourse: builder.mutation<Course, { id: string | number; payload: Partial<Course> }>({
            query: ({ id, payload }) => ({
                url: `/courses/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.id }],
        }),
        deleteCourse: builder.mutation<string | number, string | number>({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        publishCourse: builder.mutation<Course, string | number>({
            query: (id) => ({
                url: `/courses/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
    }),
})

export const {
    useGetCoursesByProgramQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    usePublishCourseMutation,
} = academicApi
