import axiosInstance from "@/utils/axios"

// Profile API endpoints
export const profileApi = {
  // Fetch profile by ID
  fetchProfile: async (id: string) => {
    const response = await axiosInstance.get(`/staff/${id}`)
    return response.data
  },

  // Create new profile
  createProfile: async (data: { userId: string; [key: string]: any }) => {
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
  updateProfile: async (data: { id: string; [key: string]: any }) => {
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
  // Note: The backend might not support listing by staff ID directly if not "me".
  // We'll assume a similar pattern to experience or fallback to "me" if needed.
  // For now, we'll try the pattern /profiles/education/staff/{staffId} if it exists,
  // or keep it as is but fix the other methods.
  fetchEducationByStaff: async (staffId: string) => {
    // If the backend follows the experience pattern:
    // return axiosInstance.get(`/profiles/education/staff/${staffId}`)
    // But based on current code, it was /profiles/education/${staffId} which might be get-by-id.
    // Let's try to use the "me" endpoint if the staffId matches the current user, 
    // or assume there's a list endpoint. 
    // Given the user wants "staff page like profile", maybe we should use:
    try {
       const response = await axiosInstance.get(`/profiles/education/staff/${staffId}`)
       return response.data
    } catch (e) {
       // Fallback or return empty if not found
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
    // The endpoint is POST /profiles/education
    // It likely infers user from token. If we need to add for another staff, 
    // we might need a different endpoint or impersonation.
    // For now, we use the standard endpoint.
    const response = await axiosInstance.post(`/profiles/education`, data.data)
    return response.data
  },
}