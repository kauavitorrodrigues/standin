// Rounds a zoom to a whole percent (1.141 becomes 1.14), so the zoom in use is
// always one the label can show exactly.
export const roundZoom = (zoom: number): number => Math.round(zoom * 100) / 100;
