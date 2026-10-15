import type { PlacedSlice } from "@/features/game/utils/buildPlacedSlices";

// One edge of the outline of an object, in world px.
export type OutlineSegment = { x1: number; y1: number; x2: number; y2: number };

// The part of the box that an object occupies, for one whose footprint has a
// mask. The rectangles fill it and the segments are the edge around it, with
// no line between two occupied cells.
export type ObjectShape = {
    rects: { x: number; y: number; width: number; height: number }[];
    segments: OutlineSegment[];
};

// The box of a placed object on screen, in world px, with its draw depth.
export type ObjectBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    // How the sprite is cut for drawing, each strip with its own depth. One
    // strip with no crop for most objects.
    slices: PlacedSlice[];
    // Only for an object whose footprint is thinner than its box. The outline
    // then follows it instead of the whole box.
    shape?: ObjectShape;
};
