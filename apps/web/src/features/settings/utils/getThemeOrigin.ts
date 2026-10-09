import type { ThemeOrigin } from "@/components/providers/ThemeProvider";

// A keyboard activation has no pointer position (it reports 0,0), so the
// reveal then starts from the center of the screen.
export const getThemeOrigin = (event: Event): ThemeOrigin | undefined => {
    if (!(event instanceof MouseEvent)) return undefined;
    if (event.clientX === 0 && event.clientY === 0) return undefined;
    return { x: event.clientX, y: event.clientY };
};
