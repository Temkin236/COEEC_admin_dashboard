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
import permissionReducer from "./slices/permissionSlice"
import programsReducer from "./slices/programsSlice"
import researchProjectsReducer from "./slices/researchProjectsSlice"
import roleReducer from "./slices/roleSlice"
import staffReducer from "./slices/staffSlice"
import studentReducer from "./slices/studentSlice"
import usersReducer from "./slices/usersSlice"
import publicationsReducer from "./slices/publicationsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    staff: staffReducer,
    researchProjects: researchProjectsReducer,
    students: studentReducer,
    downloads: downloadReducer,
    contact: contactReducer,
    approval: approvalReducer,
    analytics: analyticsReducer,
    academic: academicReducer,
    programs: programsReducer,
    publications: publicationsReducer,
    departments: departmentReducer,
    calendar: calendarReducer,
    events: eventsReducer,
    role: roleReducer,
    permission: permissionReducer,
    users: usersReducer,
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