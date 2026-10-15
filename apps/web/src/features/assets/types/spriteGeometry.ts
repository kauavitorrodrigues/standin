export type Cell = { col: number; row: number };

// A rectangle on the image, in px.
export type Crop = { x: number; y: number; w: number; h: number };

// In tiles, counted from the bottom of the crop.
export type Footprint = { w: number; h: number; offsetX: number };
