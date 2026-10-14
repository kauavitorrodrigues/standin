import type { ScreenRect } from "@/features/editor/types/screen-rect";

// The bar keeps this far from the object, and this much room above it before
// it flips below.
const GAP_PX = 8;
const ROOM_ABOVE_PX = 56;

// Puts the bar of the selected object over it by writing the transform of the
// element, never through React state. The element sits at the corner of the
// page and is moved to the middle of the top edge of the object. It goes
// under the object when there is no room above (`data-below`). With no anchor
// it hides.
export const applyToolbarAnchor = (
    element: HTMLElement | null,
    anchor: ScreenRect | null
): void => {
    if (!element) return;

    if (!anchor) {
        element.style.visibility = "hidden";
        return;
    }

    const below = anchor.top < ROOM_ABOVE_PX;
    const x = anchor.left + anchor.width / 2;
    const y = below ? anchor.top + anchor.height + GAP_PX : anchor.top - GAP_PX;
    element.dataset.below = String(below);
    element.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    element.style.visibility = "visible";
};
