# RTK Query Migration Guide

This guide details the migration from Redux Toolkit Async Thunks to RTK Query for the COEEC Admin Dashboard.

## 1. Base API Configuration

A centralized API configuration has been created at `src/store/api/baseApi.ts`.
- **Base URL**: Uses `API_BASE_URL` from constants.
- **Authentication**: Automatically attaches the Bearer token from Redux state or localStorage.
- **Re-authentication**: Includes interceptor logic to handle 401 errors, attempt token refresh, and retry the original request.

## 2. Feature API Services

New API services have been created for all features, replacing the logic in `src/store/slices/*`. Use these hooks in your components.

### Authentication & Users
- **Auth**: `src/store/api/authApi.ts` (`useLoginMutation`, `useValidateTokenQuery`, etc.)
- **Users**: `src/store/api/usersApi.ts` (`useGetUsersQuery`, `useCreateUserMutation`, etc.)
- **Roles**: `src/store/api/roleApi.ts` (`useGetRolesQuery`, `useUpdateRoleMutation`, etc.)
- **Permissions**: `src/store/api/permissionApi.ts` (`useGetPermissionsQuery`)

### Academic & Programs
- **Academic (Courses)**: `src/store/api/academicApi.ts` (`useGetCoursesByProgramQuery`, `useCreateCourseMutation`, etc.)
- **Programs**: `src/store/api/programsApi.ts` (`useGetProgramsQuery`, `useCreateProgramMutation`, etc.)
- **Departments**: `src/store/api/departmentApi.ts` (`useGetDepartmentsQuery`, `useGetDepartmentByIdQuery`, etc.)
- **Calendar**: `src/store/api/calendarApi.ts` (`useGetCalendarsQuery`, `useAddEventToCalendarMutation`, etc.)

### Research & Staff
- **Staff**: `src/store/api/staffApi.ts` (`useGetStaffQuery`, `useUploadCVMutation`, etc.)
- **Research Projects**: `src/store/api/researchProjectsApi.ts` (`useGetResearchProjectsQuery`, `useCreateResearchProjectMutation`, etc.)
- **Publications**: `src/store/api/publicationApi.ts` (`useGetMyPublicationsQuery`, `useCreatePublicationMutation`, etc.)

### Content & Communication
- **Content (CMS)**: `src/store/api/contentApi.ts` (`useGetContentQuery`, `useUpdateContentMutation`, etc.)
- **Events**: `src/store/api/eventsApi.ts` (`useGetEventsQuery`, `useCreateEventMutation`, etc.)
- **Downloads**: `src/store/api/downloadApi.ts` (`useGetDownloadsQuery`, `useUploadFileMutation`, etc.)
- **Contact**: `src/store/api/contactApi.ts` (`useGetContactsQuery`, `useUpdateContactStatusMutation`)
- **Approvals**: `src/store/api/approvalApi.ts` (`useGetPendingApprovalsQuery`, `useApproveItemMutation`, etc.)

### Analytics
- **Analytics**: `src/store/api/analyticsApi.ts` (`useGetDashboardStatsQuery`, `useGetVisitorStatsQuery`)

### Students
- **Students & Alumni**: `src/store/api/studentApi.ts` (`useGetStudentsQuery`, `useGetAlumniQuery`, etc.)

**Note on Mock Data**: Several APIs (Student, Analytics, Approval, Contact, Download, Content) use `queryFn` to preserve the existing behavior of returning mock data if the backend API fails.

## 3. Store Setup

The `src/store/index.ts` file has been updated to include the `api` reducer and middleware.

## 4. Migration Strategy

1.  **Do not delete the old slices yet.** They likely contain types (`interface`, `type`) that are imported by the new API files and your components.
2.  **Update Components One by One**:
    *   Find a component using `useDispatch()` with a thunk (e.g., `dispatch(fetchStaff(...))`).
    *   Replace it with the corresponding query hook (e.g., `const { data, isLoading } = useGetStaffQuery(...)`).
    *   For mutations (create/update/delete), replace `dispatch(createStaff(...))` with the mutation trigger from `const [createStaff] = useCreateStaffMutation()`.
3.  **Cleanup**:
    *   Once all components for a feature are updated, check if the slice file is only exporting types.
    *   If it still allows some client-side state manipulation (like `clearError` or `setPage`), decide if you want to keep that in a smaller slice or move it to local component state (often cleaner with RTK Query).
    *   Eventually, move the `type`/`interface` definitions to a shared `src/types` folder or keep them in the API file, and delete the old slice file.

## 5. Usage Example

**Fetching Staff (Before):**
```tsx
const dispatch = useDispatch();
const { items, loading } = useSelector(state => state.staff);

useEffect(() => {
  dispatch(fetchStaff({ page: 1, limit: 10 }));
}, [dispatch]);
```

**Fetching Staff (After):**
```tsx
const { data, isLoading } = useGetStaffQuery({ page: 1, limit: 10 });
const items = data?.items || [];
```
