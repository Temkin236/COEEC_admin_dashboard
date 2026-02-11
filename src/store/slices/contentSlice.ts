import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"
import { aboutApi } from "@/api/aboutApi"

type ContentType = "homepage" | "about" | "departments" | "news" | string

const DEMO_CONTENT: Record<string, any[]> = {
  homepage: [
    { id: "h1", type: "hero", title: "Welcome to COEEC", subtitle: "Driving innovation in Engineering & Computing", description: "Explore programs, research, and community at ASTU.", language: "en", status: "draft", order: 1, image: "" },
  ],
  about: [
    { id: "a1", history: "Founded to lead excellence in engineering education.", mission: "To produce competent, innovative, and ethical professionals in electrical engineering and computing through quality education, problem-solving research, and community-oriented services that contribute to the sustainable development of the nation.", vision: "To be a premier center of excellence in applied engineering and computing in East Africa by 2030, recognized for high-quality graduates and impactful innovations.", deanName: "Dr. Berhanu Bulcha", deanMessage: "\"We are not just teaching engineering; we are cultivating the mindset of innovation that will drive Ethiopia's digital transformation. Our students are the architects of tomorrow.\"", deanImage: "", values: "Excellence: Striving for the highest standards in teaching and research. Inclusivity: Fostering a diverse and welcoming academic environment. Integrity: Upholding honesty, ethics, and accountability in all actions.", goals: "Quality Education\nResearch Leadership", historyItems: [{ year: "1993", title: "Foundation", description: "Established as the Department of Electrical Engineering under Nazareth Technical College.", image: "https://picsum.photos/400/300?random=35" }, { year: "2006", title: "University Status", description: "Upgraded to Adama University, expanding programs to include Computer Science.", image: "https://picsum.photos/400/300?random=36" }, { year: "2011", title: "Center of Excellence", description: "Designated as a Science and Technology University (ASTU) by the Ministry of Education.", image: "https://picsum.photos/400/300?random=37" }, { year: "2018", title: "New Complex", description: "Inauguration of the dedicated COEEC building with state-of-the-art laboratories.", image: "https://picsum.photos/400/300?random=38" }, { year: "2023", title: "PhD Programs", description: "Launched PhD programs in Power Engineering and Software Engineering.", image: "https://picsum.photos/400/300?random=39" }], adminItems: [{ name: "Dr. Berhanu Bulcha", role: "DEAN", image: "https://picsum.photos/300/300?random=30" }, { name: "Dr. Sarah Ahmed", role: "VICE DEAN, ACADEMICS", image: "https://picsum.photos/300/300?random=7" }, { name: "Mr. Dawit Tadesse", role: "VICE DEAN, RESEARCH", image: "https://picsum.photos/300/300?random=8" }, { name: "Ms. Tigist Alemu", role: "HEAD, ADMINISTRATION", image: "https://picsum.photos/300/300?random=9" }] },
  ],
  departments: [
    { id: "d1", name: "Computer Science and Engineering", code: "CSE", head: "Dr. Abebe Kebede", description: "Leading CS education and research.", programs: ["BSc", "MSc", "PhD"], researchAreas: ["AI", "Systems"], staffCount: 45, email: "cse@astu.edu.et", phone: "+251-11-0000000" },
  ],
}

export const fetchContent = createAsyncThunk<{ type: ContentType; data: any[] }, { type: ContentType; language?: string }>(
  "content/fetchContent",
  async ({ type, language = "en" }) => {
    try {
      if (type === 'about') {
        const data = await aboutApi.getAbout();
        return { type, data };
      }
      const response = await axiosInstance.get(`/content/${type}?lang=${language}`)
      return { type, data: response.data }
    } catch (e) {
      const data = DEMO_CONTENT[type] || []
      return { type, data }
    }
  },
)

export const createContent = createAsyncThunk<{ type: ContentType; data: any }, { type: ContentType; data: any }>(
  "content/createContent",
  async ({ type, data }) => {
    try {
      if (type === 'about') {
        const result = await aboutApi.createAbout(data);
        return { type, data: result };
      }
      const response = await axiosInstance.post(`/content/${type}`, data)
      return { type, data: response.data }
    } catch (e) {
      return { type, data: { id: Date.now().toString(), ...data } }
    }
  },
)

export const updateContent = createAsyncThunk<{ type: ContentType; data: any }, { type: ContentType; id: string; data: any }>(
  "content/updateContent",
  async ({ type, id, data }) => {
    try {
      if (type === 'about') {
        const result = await aboutApi.updateAbout(id, data);
        return { type, data: result };
      }
      const response = await axiosInstance.put(`/content/${type}/${id}`, data)
      return { type, data: response.data }
    } catch (e) {
      return { type, data: { id, ...data } }
    }
  },
)

export const deleteContent = createAsyncThunk<{ type: ContentType; id: string }, { type: ContentType; id: string }>(
  "content/deleteContent",
  async ({ type, id }) => {
    try {
      if (type === 'about') {
         await aboutApi.deleteAbout(id);
      } else {
         await axiosInstance.delete(`/content/${type}/${id}`)
      }
    } catch (e) {}
    return { type, id }
  },
)

// Timeline Thunks
export const addAboutTimelineItem = createAsyncThunk<any, { aboutId: string; data: any }>(
  "content/addAboutTimelineItem",
  async ({ aboutId, data }) => {
    const response = await aboutApi.addTimelineItem(aboutId, data);
    return response;
  }
);

export const updateAboutTimelineItem = createAsyncThunk<any, { aboutId: string; itemId: string; data: any }>(
  "content/updateAboutTimelineItem",
  async ({ aboutId, itemId, data }) => {
    const response = await aboutApi.updateTimelineItem(aboutId, itemId, data);
    return response;
  }
);

export const deleteAboutTimelineItem = createAsyncThunk<{ itemId: string }, { aboutId: string; itemId: string }>(
  "content/deleteAboutTimelineItem",
  async ({ aboutId, itemId }) => {
    await aboutApi.deleteTimelineItem(aboutId, itemId);
    return { itemId };
  }
);

interface SectionState { items: any[]; loading: boolean; error: string | null }
interface ContentState { [key: string]: SectionState }

const initialState: ContentState = {
  homepage: { items: [], loading: false, error: null },
  about: { items: [], loading: false, error: null },
  departments: { items: [], loading: false, error: null },
  news: { items: [], loading: false, error: null },
}

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    clearContentError: (state, action: PayloadAction<{ type: ContentType }>) => {
      const { type } = action.payload
      if (state[type]) state[type].error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state, action) => {
        const type = action.meta.arg.type
        if (state[type]) {
          state[type].loading = true
          state[type].error = null
        }
      })
      .addCase(fetchContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any }>) => {
        const { type, data } = action.payload
        if (state[type]) {
          state[type].loading = false
          // normalize data into an array of items
          if (Array.isArray(data)) {
            state[type].items = data
          } else if (data && Array.isArray((data as any).items)) {
            state[type].items = (data as any).items
          } else if (data && typeof data === 'object') {
            // single item returned — wrap into array
            state[type].items = [data]
          } else {
            state[type].items = []
          }
        }
      })
      .addCase(fetchContent.rejected, (state, action) => {
        const type = (action.meta as any).arg.type as ContentType
        if (state[type]) {
          state[type].loading = false
          state[type].error = action.error.message || null
        }
      })
      .addCase(createContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any }>) => {
        const { type, data } = action.payload
        if (state[type]) {
          if (!Array.isArray(state[type].items)) state[type].items = []
          state[type].items.unshift(data)
        }
      })
      .addCase(updateContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any }>) => {
        const { type, data } = action.payload
        if (state[type]) {
          if (!Array.isArray(state[type].items)) {
            // replace with single-item array
            state[type].items = [data]
          } else {
            const index = state[type].items.findIndex((item: any) => item.id === data.id)
            if (index !== -1) state[type].items[index] = data
            else state[type].items.unshift(data)
          }
        }
      })
      .addCase(deleteContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; id: string }>) => {
        const { type, id } = action.payload
        if (state[type]) state[type].items = state[type].items.filter((item: any) => item.id !== id)
      })
      // Timeline items reducers
      .addCase(addAboutTimelineItem.fulfilled, (state, action) => {
        const newItem = action.payload;
        if (state.about && state.about.items && state.about.items.length > 0) {
           const aboutSection = state.about.items[0];
           // Ensure we access 'timeline' property correctly, assuming backend returns it
           // If backend returns 'historyItems' instead, we might need adjustment, but docs say 'timeline'
           if (!aboutSection.timeline) aboutSection.timeline = [];
           aboutSection.timeline.push(newItem);
           // Also update historyItems if that is what the frontend uses for display compatibility
           if (!aboutSection.historyItems) aboutSection.historyItems = [];
           aboutSection.historyItems.push(newItem);
        }
      })
      .addCase(updateAboutTimelineItem.fulfilled, (state, action) => {
        const updatedItem = action.payload; 
        if (state.about && state.about.items && state.about.items.length > 0) {
           const aboutSection = state.about.items[0];
           if (aboutSection.timeline) {
             const index = aboutSection.timeline.findIndex((t: any) => t.id === updatedItem.id);
             if (index !== -1) aboutSection.timeline[index] = updatedItem;
           }
           if (aboutSection.historyItems) {
             const index = aboutSection.historyItems.findIndex((t: any) => t.id === updatedItem.id);
             if (index !== -1) aboutSection.historyItems[index] = updatedItem;
           }
        }
      })
      .addCase(deleteAboutTimelineItem.fulfilled, (state, action) => {
        const { itemId } = action.payload;
        if (state.about && state.about.items && state.about.items.length > 0) {
           const aboutSection = state.about.items[0];
           if (aboutSection.timeline) {
             aboutSection.timeline = aboutSection.timeline.filter((t: any) => t.id !== itemId);
           }
           if (aboutSection.historyItems) {
             aboutSection.historyItems = aboutSection.historyItems.filter((t: any) => t.id !== itemId);
           }
        }
      })
  },
})

export const { clearContentError } = contentSlice.actions
export default contentSlice.reducer
