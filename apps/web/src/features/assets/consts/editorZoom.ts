export const ZOOMS = [1, 2, 3, 4, 6, 8] as const;

export type Zoom = (typeof ZOOMS)[number];

export const DEFAULT_ZOOM: Zoom = 4;
