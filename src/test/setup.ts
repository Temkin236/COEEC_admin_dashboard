import "@testing-library/jest-dom"

// Ant Design uses window.matchMedia for responsive grid breakpoints.
// jsdom does not implement it, so we provide a minimal stub.
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
})

// Ant Design's @rc-component/resize-observer requires ResizeObserver.
// jsdom does not implement it; provide a no-op stub.
window.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
