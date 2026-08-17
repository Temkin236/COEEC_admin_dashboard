import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"

// ─── Module mocks ────────────────────────────────────────────────────────────
//
// Ant Design uses ResizeObserver and matchMedia which jsdom doesn't provide.
// Mock them to keep tests environment-agnostic.

const mockDispatch = vi.fn(() => Promise.resolve({ payload: { items: [], total: 0, page: 1, limit: 10 } }))

vi.mock("@/store/hooks", () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) =>
        selector({
            staff: {
                items: [
                    {
                        id: "1",
                        displayName: "Dr. Alice Tadesse",
                        title: "Associate Professor",
                        email: "alice@astu.edu.et",
                        department: { id: "d1", name: "Computer Science", isDisabled: false },
                        researchAreas: ["AI", "ML"],
                        officeLocation: "A-101",
                        photo: null,
                        cvUrl: null,
                    },
                    {
                        id: "2",
                        displayName: "Dr. Bob Lemma",
                        title: "Lecturer",
                        email: "bob@astu.edu.et",
                        department: null,
                        researchAreas: [],
                        officeLocation: null,
                        photo: null,
                        cvUrl: "https://example.com/cv.pdf",
                    },
                ],
                total: 2,
                page: 1,
                limit: 10,
                loading: false,
                error: null,
            },
        }),
}))

vi.mock("@/store/slices/staffSlice", () => ({
    fetchStaff: vi.fn(() => ({ type: "staff/fetchStaff" })),
    deleteStaff: vi.fn((id: string) => ({ type: "staff/deleteStaff", payload: id })),
}))

vi.mock("@/utils/constants", () => ({
    DEPARTMENTS: [
        { code: "cs", name: "Computer Science" },
        { code: "ee", name: "Electrical Engineering" },
    ],
    API_BASE_URL: "http://localhost:4000/api",
}))

// ─── Import the component under test ─────────────────────────────────────────
// Import after mocks are registered so Vitest hoisting picks them up.
import StaffListPage from "@/pages/staff/StaffListPage"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStaffList() {
    return render(
        <MemoryRouter initialEntries={["/staff"]}>
            <StaffListPage />
        </MemoryRouter>,
    )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
    mockDispatch.mockClear()
})

describe("StaffListPage — baseline", () => {
    it("renders the page heading", () => {
        renderStaffList()
        expect(screen.getByText("Staff Members")).toBeInTheDocument()
    })

    it("renders the Add Staff button", () => {
        renderStaffList()
        // The button contains 'Add' text (mobile) or 'Add Staff' (desktop)
        expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument()
    })

    it("renders the search input", () => {
        renderStaffList()
        expect(
            screen.getByPlaceholderText("Search by name or email..."),
        ).toBeInTheDocument()
    })

    it("renders staff member names from the store", () => {
        renderStaffList()
        expect(screen.getByText("Dr. Alice Tadesse")).toBeInTheDocument()
        expect(screen.getByText("Dr. Bob Lemma")).toBeInTheDocument()
    })

    it("renders the department badge for a staff member with a department", () => {
        renderStaffList()
        expect(screen.getByText("Computer Science")).toBeInTheDocument()
    })

    it("renders 'No Department' badge for a staff member without a department", () => {
        renderStaffList()
        expect(screen.getByText("No Department")).toBeInTheDocument()
    })

    it("renders a View CV link for staff who have a CV URL", () => {
        renderStaffList()
        expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument()
    })

    it("shows 'No CV' label for staff without a CV URL", () => {
        renderStaffList()
        expect(screen.getByText("No CV")).toBeInTheDocument()
    })

    it("dispatches fetchStaff on mount", () => {
        renderStaffList()
        expect(mockDispatch).toHaveBeenCalledTimes(1)
    })
})
