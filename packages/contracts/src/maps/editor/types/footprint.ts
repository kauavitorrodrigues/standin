// Geometry of placed objects. `tileX`/`tileY` is the bottom left cell of the
// footprint, which grows to the right and upwards.
export type Footprint = {
    tileX: number;
    tileY: number;
    width: number;
    height: number;
};
