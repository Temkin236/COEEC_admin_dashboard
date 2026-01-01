
import { api } from './baseApi'
import {
    StudentItem,
    AlumniItem,
    StudentLife,
    Club,
    Career
} from '@/types/student.types'
import { Paginated } from '@/types/common.types'

export const studentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStudents: builder.query<Paginated<StudentItem>, { page?: number; limit?: number }>({
            providesTags: ['Student'],
            // Replicating the mock fallback behavior from the slice
            async onQueryStarted(arg, { queryFulfilled }) {
                // We can't easily intercept the error and return success here without queryFn.
                // But queryFn bypasses the baseQuery completely if used, which loses the benefit of the global baseQuery (auth handling etc).
                // A better approach for the 'mock on fail' requirement is to use queryFn that delegates to fetchBaseQuery 
                // and catches the error.
            },
            // Using queryFn to handle the mock fallback
            async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
                const { page = 1, limit = 10 } = args
                const result = await fetchWithBQ(`/students?page=${page}&limit=${limit}`)

                if (result.error) {
                    // Fallback mock data
                    const items: StudentItem[] = [
                        { id: 1, program: "Computer Science", level: "BSc", count: 450, male: 320, female: 130 },
                        { id: 2, program: "Computer Science", level: "MSc", count: 45, male: 30, female: 15 },
                    ]
                    return { data: { items, total: items.length } }
                }

                return { data: result.data as Paginated<StudentItem> }
            }
        }),
        getAlumni: builder.query<Paginated<AlumniItem>, { page?: number; limit?: number }>({
            providesTags: ['Alumni'],
            async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
                const { page = 1, limit = 10 } = args
                const result = await fetchWithBQ(`/students/alumni?page=${page}&limit=${limit}`)

                if (result.error) {
                    const items: AlumniItem[] = [
                        {
                            id: 1,
                            name: "Abebe Kebede",
                            program: "Computer Science",
                            graduationYear: 2023,
                            currentPosition: "Software Engineer",
                            organization: "Google",
                            status: "verified",
                        },
                        {
                            id: 2,
                            name: "Chaltu Gemechu",
                            program: "Electrical Engineering",
                            graduationYear: 2022,
                            currentPosition: "Hardware Engineer",
                            organization: "Intel",
                            status: "verified",
                        },
                    ]
                    return { data: { items, total: items.length } }
                }

                return { data: result.data as Paginated<AlumniItem> }
            }
        }),
        getStudentLife: builder.query<StudentLife, void>({
            query: () => '/student-life',
            providesTags: ['StudentLife'],
        }),
        updateStudentLife: builder.mutation<StudentLife, Partial<StudentLife>>({
            query: (data) => ({
                url: '/student-life',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['StudentLife'],
        }),
        getClubs: builder.query<Club[], void>({
            query: () => '/student-life/clubs',
            providesTags: ['Club'],
        }),
        createClub: builder.mutation<Club, Partial<Club>>({
            query: (data) => ({
                url: '/student-life/clubs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Club'],
        }),
        updateClub: builder.mutation<Club, { id: string; data: Partial<Club> }>({
            query: ({ id, data }) => ({
                url: `/ student - life / clubs / ${id} `,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Club'],
        }),
        deleteClub: builder.mutation<string, string>({
            query: (id) => ({
                url: `/ student - life / clubs / ${id} `,
                method: 'DELETE',
            }),
            invalidatesTags: ['Club'],
        }),
        getCareers: builder.query<Career[], void>({
            query: () => '/student-life/career',
            providesTags: ['Career'],
        }),
        createCareer: builder.mutation<Career, Partial<Career>>({
            query: (data) => ({
                url: '/student-life/career',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Career'],
        }),
        updateCareer: builder.mutation<Career, { id: string; data: Partial<Career> }>({
            query: ({ id, data }) => ({
                url: `/ student - life / career / ${id} `,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Career'],
        }),
        deleteCareer: builder.mutation<string, string>({
            query: (id) => ({
                url: `/ student - life / career / ${id} `,
                method: 'DELETE',
            }),
            invalidatesTags: ['Career'],
        }),
    }),
})

export const {
    useGetStudentsQuery,
    useGetAlumniQuery,
    useGetStudentLifeQuery,
    useUpdateStudentLifeMutation,
    useGetClubsQuery,
    useCreateClubMutation,
    useUpdateClubMutation,
    useDeleteClubMutation,
    useGetCareersQuery,
    useCreateCareerMutation,
    useUpdateCareerMutation,
    useDeleteCareerMutation
} = studentApi
