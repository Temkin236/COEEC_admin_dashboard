export interface StaffItem {
    id: string
    userId?: string
    staffId?: string
    rank?: string
    displayName: string
    title: string
    departmentId?: string
    photoId?: string | null
    researchAreas?: string[]
    biography?: any
    email: string
    phone?: string
    officeLocation?: string
    cvId?: string | null
    createdAt?: string
    updatedAt?: string
    department?: {
        id: string
        name: string
        slug: string
        description: string
        headId: string | null
        pageId: string | null
        createdAt: string
        updatedAt: string
        isDisabled: boolean
    }
    photo?: string | null
    cvUrl?: string
}
