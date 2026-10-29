import type { FootprintMask } from "@standin/contracts";
import type { AuthoringIssue } from "./issue";

// A rectangle of mask cells. There are SOLID_MASK_SUBDIVISION cells per tile
// on each side, so a 2 x 1 tile footprint has 8 x 4 cells.
export type CellRect = { x: number; y: number; w: number; h: number };

export type FootprintMasksInput = {
    // Footprint size in tiles.
    w: number;
    h: number;
    // The occupied cells. Left out, the whole rectangle is occupied (no mask).
    occupied?: CellRect;
    // The cells that block the way. Left out, the occupied tiles block whole
    // (no solid mask).
    solid?: CellRect;
};

export type FootprintMasksResult =
    | {
          ok: true;
          // Null when the asset schema takes the field as absent.
          mask: FootprintMask | null;
          solidMask: FootprintMask | null;
      }
    | { ok: false; issues: AuthoringIssue[] };
