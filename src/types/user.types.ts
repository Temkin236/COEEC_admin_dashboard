export interface User {
    id: string
    email: string
    displayName: string
    roles?: any[] // Using any[] to handle the complex nested structure from API
    roleIds?: string[] // For form submission
    createdAt?: string
    updatedAt?: string
}

export interface InviteResponse {
    userId: string
    inviteUrl: string
}

export interface Role {
    id: string
    name: string
    description?: string
    system?: boolean
    permissionIds?: string[]
    permissions?: any[]
    createdAt?: string
    updatedAt?: string
}

// Re-export Permission from auth types to avoid duplication/confusion
export type { Permission } from './auth.types'
