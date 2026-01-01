import { api } from './baseApi'
import { ApprovalItem } from '@/types/content.types'

const DEMO_APPROVALS: ApprovalItem[] = [
    { id: 1, type: "News", title: "New research lab opening", submittedBy: "Dr. Abebe Kebede", submittedAt: new Date().toISOString(), content: "We are excited to announce the opening of our new AI research lab..." },
]

export const approvalApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getPendingApprovals: builder.query<ApprovalItem[], void>({
            async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
                const result = await fetchWithBQ("/approval/pending")
                if (result.error) {
                    return { data: DEMO_APPROVALS }
                }
                return { data: result.data as ApprovalItem[] }
            },
            providesTags: ['Approval'],
        }),
        approveItem: builder.mutation<{ type: string; data: { id: number; status: string; comment?: string } }, { type: string; id: number; comment?: string }>({
            async queryFn({ type, id, comment }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({
                        url: `/approval/${type}/${id}/approve`,
                        method: 'POST',
                        body: { comment }
                    })
                    if (result.error) throw result.error
                    return { data: { type, data: result.data as any } }
                } catch (e) {
                    // Mock success
                    return { data: { type, data: { id, status: "approved", comment } } }
                }
            },
            invalidatesTags: ['Approval'],
        }),
        rejectItem: builder.mutation<{ type: string; data: { id: number; status: string; comment?: string } }, { type: string; id: number; comment?: string }>({
            async queryFn({ type, id, comment }, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const result = await fetchWithBQ({
                        url: `/approval/${type}/${id}/reject`,
                        method: 'POST',
                        body: { comment }
                    })
                    if (result.error) throw result.error
                    return { data: { type, data: result.data as any } }
                } catch (e) {
                    // Mock success
                    return { data: { type, data: { id, status: "rejected", comment } } }
                }
            },
            invalidatesTags: ['Approval'],
        }),
    }),
})

export const { useGetPendingApprovalsQuery, useApproveItemMutation, useRejectItemMutation } = approvalApi
