import { api } from './baseApi'
import { LoginResponse, AuthUser, LoginCredentials, ActivateAccountCredentials } from '@/types/auth.types'

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            // We can use onQueryStarted to handle side effects like localStorage
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    localStorage.setItem("token", data.accessToken)
                    localStorage.setItem("refreshToken", data.refreshToken)
                    if (data.user) {
                        localStorage.setItem("auth_user", JSON.stringify(data.user))
                        if (data.user.permissions) {
                            localStorage.setItem("user_permissions", JSON.stringify(data.user.permissions))
                        }
                    }
                } catch (err) {
                    // Error handling is managed by the component or global error handler
                }
            },
        }),
        validateToken: builder.query<AuthUser, void>({
            query: () => '/auth/me',
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    localStorage.setItem("auth_user", JSON.stringify(data))
                    if (data.permissions) {
                        localStorage.setItem("user_permissions", JSON.stringify(data.permissions))
                    }
                } catch (err) {
                    // If validation fails, the baseQuery might handle 401, or we handle it here
                }
            }
        }),
        activateAccount: builder.mutation<void, ActivateAccountCredentials>({
            query: (data) => ({
                url: '/auth/activate',
                method: 'POST',
                body: data,
            }),
        }),
    }),
})

export const { useLoginMutation, useValidateTokenQuery, useActivateAccountMutation } = authApi
