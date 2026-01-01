import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/utils/constants'
import { RootState } from '@/store'
import { LoginResponse } from '@/types/auth.types'
import { logout } from '@/store/slices/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        // Get token from state or localStorage
        // Ideally we use state, but consistent with existing axios approach we fallback to localStorage
        const token = (getState() as RootState).auth.token || localStorage.getItem('token')
        const language = localStorage.getItem('language') || 'en'

        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }

        headers.set('Accept-Language', language)

        return headers
    },
})

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        // Try to refresh the token
        const refreshToken = (api.getState() as RootState).auth.refreshToken || localStorage.getItem("refreshToken")

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            )

            if (refreshResult.data) {
                const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as LoginResponse

                // Store new tokens
                localStorage.setItem("token", accessToken)
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken)
                }

                // Dispatch action to update store if needed, though we primarily rely on localStorage/re-reading state
                // For now, let's assume the next query will pick up the new token from localStorage/state 
                // if we dispatch an update or if we just manually update the headers for the retry.
                // Actually, best to update the Redux state so the next prepareHeaders works correctly.
                // However, we can't easily dispatch login.fulfilled here without circular deps if not careful.
                // We'll just rely on localStorage for the retry's prepareHeaders if state isn't updated instantly? 
                // No, prepareHeaders reads state. We should dispatch an action updates the token.
                // Since we are keeping authSlice, we can dispatch a dedicated action or just update localStorage 
                // and hope the retry works? 
                // The safest is to manually set the Authorization header for the retry:

                // Retry the initial query
                result = await baseQuery(
                    {
                        ...((typeof args === 'string') ? { url: args } : args),
                        headers: {
                            ...((typeof args !== 'string' && args.headers) ? args.headers : {}),
                            authorization: `Bearer ${accessToken}`
                        }
                    },
                    api,
                    extraOptions
                )
            } else {
                // Refresh failed, logout
                api.dispatch(logout())
                window.location.href = "/login"
            }
        } else {
            // No refresh token, logout
            api.dispatch(logout())
            window.location.href = "/login"
        }
    }
    return result
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'Student', 'Alumni', 'StudentLife', 'Club', 'Career',
        'User', 'Role', 'Permission',
        'Course', 'Program', 'Department', 'Calendar', 'Event',
        'Staff', 'ResearchProject', 'Publication',
        'Content', 'Download', 'Contact', 'Approval'
    ],
    endpoints: () => ({}),
})
