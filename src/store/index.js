import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import contentReducer from "./slices/contentSlice"
import staffReducer from "./slices/staffSlice"
import researchReducer from "./slices/researchSlice"
import studentReducer from "./slices/studentSlice"
import downloadReducer from "./slices/downloadSlice"
import contactReducer from "./slices/contactSlice"
import approvalReducer from "./slices/approvalSlice"
import analyticsReducer from "./slices/analyticsSlice"

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["staff/uploadFile", "downloads/uploadFile"],
      },
    }),
})

// Infer types for convenience in TS files
export const AppDispatch = store.dispatch
export const getRootState = store.getState
