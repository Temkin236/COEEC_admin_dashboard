import axiosInstance from "@/utils/axios";

export const aboutApi = {
  getAbout: async () => {
    const response = await axiosInstance.get("/about");
    return response.data;
  },
  createAbout: async (data: any) => {
    const response = await axiosInstance.post("/about", data);
    return response.data;
  },
  updateAbout: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/about/${id}`, data);
    return response.data;
  },
  deleteAbout: async (id: string) => {
    const response = await axiosInstance.delete(`/about/${id}`);
    return response.data;
  },
  addTimelineItem: async (aboutId: string, data: any) => {
    const response = await axiosInstance.post(`/about/${aboutId}/timeline`, data);
    return response.data;
  },
  updateTimelineItem: async (aboutId: string, itemId: string, data: any) => {
    const response = await axiosInstance.put(`/about/${aboutId}/timeline/${itemId}`, data);
    return response.data;
  },
  deleteTimelineItem: async (aboutId: string, itemId: string) => {
    const response = await axiosInstance.delete(`/about/${aboutId}/timeline/${itemId}`);
    return response.data;
  },
};
