export interface Permission {
    id: string
    action: string
    resource: string
    description?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface AuthUser {
    id: string
    email: string
    role: string
    name?: string
    permissions?: Permission[]
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: AuthUser
}

export interface ActivateAccountCredentials {
    token: string
    password: string
    confirmPassword: string
}
