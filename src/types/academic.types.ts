export interface Department {
    id: string
    name: string
    slug: string
    description: string
    headId?: string
    pageId?: string
    createdAt?: string
    updatedAt?: string
}

export type Course = {
    id: number
    code: string
    name: string
    credits: number
    department?: string
    [key: string]: any
}

export interface Program {
    id: string | number
    name?: string
    title?: string
    slug?: string
    description?: string
    level?: string
    duration?: string
    durationMonths?: number | null
    credits?: number
    department?: string
    departmentId?: string
    status?: string
    state?: string  // Backend uses 'state' not 'status'
    code?: string
    order?: number
    createdAt?: string
    updatedAt?: string
    [key: string]: any
}

export interface CalendarEvent {
    id: string | number
    title: string
    description?: string
    startDate: string
    endDate: string
    state?: string
    status?: string
    createdAt?: string
    updatedAt?: string
    [key: string]: any
}

export interface AcademicCalendar {
    id: string | number
    title: string
    description?: string
    academicYear?: string
    state?: string
    status?: string
    events?: CalendarEvent[]
    createdAt?: string
    updatedAt?: string
    [key: string]: any
}
