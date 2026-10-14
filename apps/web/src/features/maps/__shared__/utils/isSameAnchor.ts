import type { ScreenRect } from "@/features/maps/__shared__/types/screen-rect";

// Half a pixel is not worth a DOM write.
const TOLERANCE_PX = 0.5;

const isClose = (a: number, b: number) => Math.abs(a - b) < TOLERANCE_PX;

// Whether the bar of the object is already where the anchor says. Both null
// counts as the same.
export const isSameAnchor = (
    a: ScreenRect | null,
    b: ScreenRect | null
): boolean => {
    if (a === null || b === null) return a === b;
    return (
        isClose(a.left, b.left) &&
        isClose(a.top, b.top) &&
        isClose(a.width, b.width) &&
        isClose(a.height, b.height)
    );
};
