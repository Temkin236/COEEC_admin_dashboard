import { api } from './baseApi'

import { ContentType } from '@/types/content.types'

// Re-using mock data constant from slice (would ideally share a common file, but defining here for now/simplicity)
const DEMO_CONTENT: Record<string, any[]> = {
    homepage: [
        { id: "h1", type: "hero", title: "Welcome to COEEC", subtitle: "Driving innovation in Engineering & Computing", description: "Explore programs, research, and community at ASTU.", language: "en", status: "draft", order: 1, image: "" },
    ],
    about: [
        { id: "a1", history: "Founded to lead excellence in engineering education.", mission: "To produce competent, innovative, and ethical professionals in electrical engineering and computing through quality education, problem-solving research, and community-oriented services that contribute to the sustainable development of the nation.", vision: "To be a premier center of excellence in applied engineering and computing in East Africa by 2030, recognized for high-quality graduates and impactful innovations.", deanName: "Dr. Berhanu Bulcha", deanMessage: "\"We are not just teaching engineering; we are cultivating the mindset of innovation that will drive Ethiopia's digital transformation. Our students are the architects of tomorrow.\"", deanImage: "", values: "Excellence: Striving for the highest standards in teaching and research. Inclusivity: Fostering a diverse and welcoming academic environment. Integrity: Upholding honesty, ethics, and accountability in all actions.", goals: "Quality Education\nResearch Leadership", historyItems: [{ year: "1993", title: "Foundation", description: "Established as the Department of Electrical Engineering under Nazareth Technical College.", image: "https://picsum.photos/400/300?random=35" }, { year: "2006", title: "University Status", description: "Upgraded to Adama University, expanding programs to include Computer Science.", image: "https://picsum.photos/400/300?random=36" }, { year: "2011", title: "Center of Excellence", description: "Designated as a Science and Technology University (ASTU) by the Ministry of Education.", image: "https://picsum.photos/400/300?random=37" }, { year: "2018", title: "New Complex", description: "Inauguration of the dedicated COEEC building with state-of-the-art laboratories.", image: "https://picsum.photos/400/300?random=38" }, { year: "2023", title: "PhD Programs", description: "Launched PhD programs in Power Engineering and Software Engineering.", image: "https://picsum.photos/400/300?random=39" }], adminItems: [{ name: "Dr. Berhanu Bulcha", role: "DEAN", image: "https://picsum.photos/300/300?random=30" }, { name: "Dr. Sarah Ahmed", role: "VICE DEAN, ACADEMICS", image: "https://picsum.photos/300/300?random=7" }, { name: "Mr. Dawit Tadesse", role: "VICE DEAN, RESEARCH", image: "https://picsum.photos/300/300?random=8" }, { name: "Ms. Tigist Alemu", role: "HEAD, ADMINISTRATION", image: "https://picsum.photos/300/300?random=9" }] },
    ],
    departments: [
        { id: "d1", name: "Computer Science and Engineering", code: "CSE", head: "Dr. Abebe Kebede", description: "Leading CS education and research.", programs: ["BSc", "MSc", "PhD"], researchAreas: ["AI", "Systems"], staffCount: 45, email: "cse@astu.edu.et", phone: "+251-11-0000000" },
    ],
}

export const contentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getContent: builder.query<{ type: ContentType; data: any }, { type: ContentType; language?: string }>({
            async queryFn({ type, language = "en" }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ(`/content/${type}?lang=${language}`)
                    if (result.error) throw result.error
                    return { data: { type, data: result.data } }
                } catch (e) {
                    const data = DEMO_CONTENT[type] || []
                    return { data: { type, data } }
                }
            },
            providesTags: (result, error, arg) => [{ type: 'Content', id: arg.type }],
        }),
        createContent: builder.mutation<{ type: ContentType; data: any }, { type: ContentType; data: any }>({
            async queryFn({ type, data }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({ url: `/content/${type}`, method: 'POST', body: data })
                    if (result.error) throw result.error
                    return { data: { type, data: result.data } }
                } catch (e) {
                    return { data: { type, data: { id: Date.now().toString(), ...data } } }
                }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Content', id: arg.type }],
        }),
        updateContent: builder.mutation<{ type: ContentType; data: any }, { type: ContentType; id: string; data: any }>({
            async queryFn({ type, id, data }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({ url: `/content/${type}/${id}`, method: 'PUT', body: data })
                    if (result.error) throw result.error
                    return { data: { type, data: result.data } }
                } catch (e) {
                    return { data: { type, data: { id, ...data } } }
                }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Content', id: arg.type }],
        }),
        deleteContent: builder.mutation<{ type: ContentType; id: string }, { type: ContentType; id: string }>({
            async queryFn({ type, id }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({ url: `/content/${type}/${id}`, method: 'DELETE' })
                    if (result.error) throw result.error
                } catch (e) { }
                return { data: { type, id } }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Content', id: arg.type }],
        }),
    }),
})

export const { useGetContentQuery, useCreateContentMutation, useUpdateContentMutation, useDeleteContentMutation } = contentApi
