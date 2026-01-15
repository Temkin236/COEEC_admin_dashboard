import axiosInstance from "@/utils/axios"

// Profile API endpoints
export const profileApi = {
  // Fetch profile by ID
  fetchProfile: async (id: string) => {
    const response = await axiosInstance.get(`/staff/${id}`)
    return response.data
  },

  // Create new profile
  createProfile: async (data: { userId: string;[key: string]: any }) => {
    // Create staff profile - ensure proper payload structure
    const payload = {
      userId: data.userId,
      displayName: data.displayName || data.fullName,
      title: data.title,
      departmentId: data.departmentId || data.department,
      email: data.email,
      phone: data.phone,
      officeLocation: data.officeLocation,
      researchAreas: data.researchAreas || [],
      biography: data.biography || data.about || {},
      photo: data.photoId || data.photo,
      cv: data.cvId || data.cv
    }
    const response = await axiosInstance.post(`/staff`, payload)
    return response.data
  },

  // Update profile (local state only)
  updateProfile: async (data: { id: string;[key: string]: any }) => {
    // This function only returns data for local state updates
    // Actual API calls should be handled by staff API
    return { id: data.id, ...data }
  },
}

// Experience API endpoints
export const experienceApi = {
  // Fetch experiences for a staff member
  fetchExperiences: async (staffId: string) => {
    const response = await axiosInstance.get(`/profiles/experiences/staff/${staffId}/experiences`)
    return response.data
  },

  // Add new experience
  addExperience: async (data: { staffId: string; data: any }) => {
    const response = await axiosInstance.post(`/profiles/experiences/staff/${data.staffId}/experiences`, data.data)
    return response.data
  },

  // Update experience
  updateExperience: async (data: { id: string; data: any }) => {
    const response = await axiosInstance.put(`/profiles/experiences/experiences/${data.id}`, data.data)
    return response.data
  },

  // Delete experience
  deleteExperience: async (id: string) => {
    await axiosInstance.delete(`/profiles/experiences/experiences/${id}`)
    return id
  },
}

// Education API endpoints
export const educationApi = {
  // Get my education
  getMyEducation: async () => {
    const response = await axiosInstance.get(`/profiles/education/me`)
    return response.data
  },

  // Fetch education by staff ID
  fetchEducationByStaff: async (staffId: string) => {
    try {
      const response = await axiosInstance.get(`/profiles/education/staff/${staffId}`)
      return response.data
    } catch (e) {
      return []
    }
  },

  // Update education
  updateEducation: async (data: { id: string; data: any }) => {
    const response = await axiosInstance.put(`/profiles/education/${data.id}`, data.data)
    return response.data
  },

  // Delete education
  deleteEducation: async (id: string) => {
    await axiosInstance.delete(`/profiles/education/${id}`)
    return id
  },

  // Add education
  addEducation: async (data: { staffId?: string; data: any }) => {
    const response = await axiosInstance.post(`/profiles/education`, data.data)
    return response.data
  },
}

// Connections API endpoints
export const connectionsApi = {
  // List my connections
  getMyConnections: async () => {
    const response = await axiosInstance.get("/profiles/connections/me")
    return response.data
  },

  // Create a connection
  createConnection: async (data: any) => {
    const response = await axiosInstance.post("/profiles/connections", data)
    return response.data
  },

  // Update a connection
  updateConnection: async (params: { id: string; data: any }) => {
    const response = await axiosInstance.put(`/profiles/connections/${params.id}`, params.data)
    return response.data
  },

  // Delete a connection
  deleteConnection: async (id: string) => {
    await axiosInstance.delete(`/profiles/connections/${id}`)
    return id
  },
}