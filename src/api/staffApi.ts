import axiosInstance from "@/utils/axios"

export interface StaffItem {
  id: string
  userId?: string
  staffId?: string
  displayName: string
  title: string
  rank?: string
  departmentId?: string
  photoId?: string | null
  researchAreas?: string[]
  biography?: any
  email: string
  phone?: string
  officeLocation?: string
  cv?: string | null
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

// Staff API endpoints
export const staffApi = {
  // Fetch staff list with pagination and filters
  fetchStaff: async (params: { page?: number; limit?: number; filters?: Record<string, any> }) => {
    const { page = 1, limit = 10, filters = {} } = params
    const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters as any })
    const response = await axiosInstance.get(`/staff?${queryParams}`)
    return response.data
  },

  // Fetch staff by ID
  fetchStaffById: async (id: string) => {
    const response = await axiosInstance.get(`/staff/${id}`)
    return response.data
  },

  // Create new staff
  createStaff: async (data: any) => {
    const payload = {
      userId: data.userId,
      staffId: data.staffId,
      displayName: data.displayName,
      title: data.title,
      rank: data.rank,
      departmentId: data.departmentId,
      email: data.email,
      phone: data.phone,
      officeLocation: data.officeLocation,
      researchAreas: data.researchAreas || [],
      biography: data.biography || {},
      photo: data.photoId,
      cv: data.cv
    }
    const response = await axiosInstance.post("/staff", payload)
    return response.data
  },

  // Update staff
  updateStaff: async (params: { id: string; data: any }) => {
    const { id, data } = params
    const payload = {
      userId: data.userId,
      staffId: data.staffId,
      displayName: data.displayName,
      title: data.title,
      rank: data.rank,
      biography: data.biography || {},
      researchAreas: data.researchAreas || [],
      email: data.email,
      phone: data.phone,
      officeLocation: data.officeLocation,
      departmentId: data.departmentId,
      // Use photo and cv, not photoId and cvId
      photo: data.photo || data.photoId || null,
      cv: data.cv || data.cvId || null,
      socialLinks: data.socialLinks || []
    }
    const response = await axiosInstance.put(`/staff/${id}`, payload)
    return response.data
  },

  // Delete staff
  deleteStaff: async (id: string) => {
    await axiosInstance.delete(`/staff/${id}`)
    return id
  },
}

// Media upload API endpoints
export const mediaApi = {
  // Upload CV
  uploadCV: async (params: { id: string; file: File }) => {
    const { id, file } = params
    const formData = new FormData()
    formData.append("files", file)
    formData.append('visibility', 'PUBLIC')

    const response = await axiosInstance.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // After uploading, link the media to the staff profile
    const mediaId = response?.data?.id || response?.data?.[0]?.id
    const mediaUrl = response?.data?.url || response?.data?.[0]?.url
    
    if (mediaId && id) {
      // Update staff with CV reference
      await axiosInstance.put(`/staff/${id}`, { cvId: mediaId })
    }
    
    return { id: mediaId, cvUrl: mediaUrl }
  },

  // Upload Photo
  uploadPhoto: async (params: { id: string; file: File }) => {
    const { id, file } = params
    const formData = new FormData()
    formData.append("files", file)
    formData.append('visibility', 'PUBLIC')

    const response = await axiosInstance.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // After uploading, link the media to the staff profile
    const mediaId = response?.data?.id || response?.data?.[0]?.id
    const mediaUrl = response?.data?.url || response?.data?.[0]?.url
    
    if (mediaId && id) {
      // Update staff with photo reference
      await axiosInstance.put(`/staff/${id}`, { photoId: mediaId })
    }
    
    return { id: mediaId, photoUrl: mediaUrl }
  },
}