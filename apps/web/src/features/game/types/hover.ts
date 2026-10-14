import type { PlacedRect } from "@/features/game/utils/placed";

// Anything the mouse can hover on the map: a desk, a zone. The bounds are in
// world px.
export type HoverTarget = {
    id: string;
    bounds: PlacedRect;
};

// What the page receives for the hovered target. The bounds are in px of the
// canvas, which is where the page draws.
export type HoverState = {
    id: string;
    screen: PlacedRect;
};
