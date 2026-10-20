import type { PlacedRect } from "@/features/game/utils/placed";

// Anything the mouse can hover on the map: a desk, a zone. The bounds are in
// world px.
export type HoverTarget = {
    id: string;
    bounds: PlacedRect;
    // The name of the place, for the targets that are shown with one, like a
    // zone.
    label?: string;
};

// What the page receives for the hovered target. The bounds are in px of the
// canvas, which is where the page draws.
export type HoverState = {
    id: string;
    screen: PlacedRect;
    label?: string;
};
