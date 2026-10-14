import type { ScreenRect } from "@/features/maps/__shared__/types/screen-rect";

// Two places on the page are the same when both are missing or every side
// matches.
export const isSameScreenRect = (
    a: ScreenRect | null,
    b: ScreenRect | null
): boolean => {
    if (a === null || b === null) return a === b;

    return (
        a.left === b.left &&
        a.top === b.top &&
        a.width === b.width &&
        a.height === b.height
    );
};
