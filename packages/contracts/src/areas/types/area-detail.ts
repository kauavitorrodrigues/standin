import type { Stamp } from "../../maps/editor/types/stamp";
import type { AreaSummary } from "./area-summary";

// An area with its stamp, as the composer opens it.
export type AreaDetail = AreaSummary & { stamp: Stamp };
