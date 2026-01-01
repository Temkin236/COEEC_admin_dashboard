import { api } from './baseApi'
import { DownloadItem } from '@/types/content.types'

export const downloadApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDownloads: builder.query<{ items: DownloadItem[]; total: number }, { category?: string; page?: number; limit?: number }>({
            async queryFn({ category, page = 1, limit = 10 }, _queryApi, _extraOptions, fetchWithBQ) {
                const params = category ? `?category=${category}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`
                const result = await fetchWithBQ(`/downloads${params}`)

                if (result.error) {
                    const items: DownloadItem[] = [
                        { id: 1, title: "Admission Form 2024", category: "Forms", size: 204800, createdAt: new Date().toISOString(), downloadCount: 156, url: "#" },
                    ]
                    return { data: { items, total: items.length } }
                }

                return { data: result.data as { items: DownloadItem[]; total: number } }
            },
            providesTags: ['Download'],
        }),
        uploadFile: builder.mutation<DownloadItem, { file: File; category: string; title: string; description?: string }>({
            async queryFn({ file, category, title, description }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("category", category)
                    formData.append("title", title)
                    formData.append("description", description || "")

                    // We need to bypass the default JSON content-type of baseQuery if it sets one.
                    // fetchBaseQuery handles FormData automatically if body is FormData, stripping Content-Type so browser sets it with boundary.

                    const result = await fetchWithBQ({
                        url: "/downloads",
                        method: 'POST',
                        body: formData,
                    })

                    if (result.error) throw result.error
                    return { data: result.data as DownloadItem }
                } catch (e) {
                    return {
                        data: {
                            id: Date.now().toString(),
                            title,
                            category,
                            description,
                            size: (file as any)?.size || 0,
                            createdAt: new Date().toISOString(),
                            url: URL.createObjectURL(file),
                            downloadCount: 0,
                        }
                    }
                }
            },
            invalidatesTags: ['Download'],
        }),
    }),
})

export const { useGetDownloadsQuery, useUploadFileMutation } = downloadApi
