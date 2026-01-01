export interface Paginated<T> {
    items: T[]
    total: number
}

export type SortOrder = 'asc' | 'desc'
