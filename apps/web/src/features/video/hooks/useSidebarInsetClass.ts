import { useSidebar } from "@/components/ui/sidebar";

// The sidebar floats over the game area. Anything that should share the space
// with it instead of sitting underneath (the video strip, the large view)
// stops short of it by the sidebar's width, and slides as it opens or closes.
export const useSidebarInsetClass = (): string => {
    const { open, isMobile } = useSidebar();
    const isSidebarOpen = open && !isMobile;

    return isSidebarOpen
        ? "right-(--sidebar-width) transition-[right] duration-200 ease-linear"
        : "right-0 transition-[right] duration-200 ease-linear";
};
