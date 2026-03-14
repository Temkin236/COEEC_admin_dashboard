import axiosInstance from "@/utils/axios"

export type OptionListType =
  | "staff-ranks"
  | "program-subprograms"
  | "program-types"
  | "course-categories"

export interface OptionListItem {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

const normalizeItems = (data: any): OptionListItem[] => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

export const fetchOptionListItems = async (type: OptionListType): Promise<OptionListItem[]> => {
  const response = await axiosInstance.get(`/option-lists/${type}`)
  return normalizeItems(response.data)
}

export const createOptionListItem = async (type: OptionListType, name: string): Promise<OptionListItem> => {
  const response = await axiosInstance.post(`/option-lists/${type}`, { name })
  return response.data
}

export const updateOptionListItem = async (type: OptionListType, id: string, name: string): Promise<OptionListItem> => {
  const response = await axiosInstance.put(`/option-lists/${type}/${id}`, { name })
  return response.data
}

export const deleteOptionListItem = async (type: OptionListType, id: string): Promise<void> => {
  await axiosInstance.delete(`/option-lists/${type}/${id}`)
}
