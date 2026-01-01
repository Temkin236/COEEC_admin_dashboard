export type ContentType = "homepage" | "about" | "departments" | "news" | string

export interface Event {
    id: string | number
    title: string
    description?: string
    startDate: string
    endDate: string
    location?: string
    type?: string
    state?: string
    status?: string
    createdAt?: string
    updatedAt?: string
    [key: string]: any
}

export interface Publication {
    id?: string
    title: string
    abstract?: string
    authors?: string[]
    year?: number
    pdfId?: string
    url?: string
    createdById?: string
    state?: string
}

export interface ResearchProject {
    id?: string
    title: string
    slug: string
    summary?: any
    startDate?: string
    endDate?: string
    members?: any[]
    documentIds?: string[]
    state?: "DRAFT" | "PUBLISHED"
}

export interface DownloadItem {
    id: number | string
    title: string
    category: string
    size: number
    createdAt: string | Date
    url: string
    downloadCount: number
    description?: string
}

export interface ContactItem {
    id: number
    name: string
    email: string
    subject: string
    message: string
    status: "new" | "read" | "responded" | "archived" | string
    createdAt: string | Date
}

export interface ApprovalItem {
    id: number
    type: string
    title: string
    submittedBy: string
    submittedAt: string | Date
    content?: string
}
