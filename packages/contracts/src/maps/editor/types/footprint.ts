import type { FootprintMask } from "../../../assets/types/footprint-mask";

// Geometry of placed objects. `tileX`/`tileY` is the bottom left cell of the
// footprint, which grows to the right and upwards. The mask, when present, says
// which cells of that rectangle the object occupies. Absent or null means all.
export type Footprint = {
    tileX: number;
    tileY: number;
    width: number;
    height: number;
    mask?: FootprintMask | null;
};
