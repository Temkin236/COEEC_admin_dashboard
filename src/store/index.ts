import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
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
import profileReducer from "./slices/profileSlice"
import programsReducer from "./slices/programsSlice"
import researchProjectsReducer from "./slices/researchProjectsSlice"
import roleReducer from "./slices/roleSlice"
import staffReducer from "./slices/staffSlice"
import studentReducer from "./slices/studentSlice"
import usersReducer from "./slices/usersSlice"
import publicationsReducer from "./slices/publicationsSlice"
import mediaReducer from "./slices/mediaSlice"
import newsReducer from "./slices/newsSlice"

// Persist configuration for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"], // Only persist user data and auth status
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
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
    news: newsReducer,
    role: roleReducer,
    permission: permissionReducer,
    profile: profileReducer,
    users: usersReducer,
    media: mediaReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "staff/uploadFile", 
          "downloads/uploadFile",
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
      },
    }),
})

export const persistor = persistStore(store)

// typed helpers
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch