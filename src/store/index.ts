import { configureStore } from "@reduxjs/toolkit"
import academicReducer from "./slices/academicSlice"
import analyticsReducer from "./slices/analyticsSlice"
import approvalReducer from "./slices/approvalSlice"
import authReducer from "./slices/authSlice"
import calendarReducer from "./slices/calendarSlice"
import contactReducer from "./slices/contactSlice"
import contentReducer from "./slices/contentSlice"
import departmentReducer from "./slices/departmentSlice"
import downloadReducer from "./slices/downloadSlice"
import eventsReducer from "./slices/eventsSlice"
import programsReducer from "./slices/programsSlice"
import researchReducer from "./slices/researchSlice"
import staffReducer from "./slices/staffSlice"
import studentReducer from "./slices/studentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    staff: staffReducer,
    research: researchReducer,
    students: studentReducer,
    downloads: downloadReducer,
    contact: contactReducer,
    approval: approvalReducer,
    analytics: analyticsReducer,
    academic: academicReducer,
    programs: programsReducer,
    departments: departmentReducer,
    calendar: calendarReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["staff/uploadFile", "downloads/uploadFile"],
      },
    }),
})

// typed helpers
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch