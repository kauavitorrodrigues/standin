import type { MapAreaStamp } from "@standin/contracts";
import { AREA_MESSAGES } from "../consts/messages";

// The composer has no Areas tab (no area inside an area), so nothing calls
// this. It only fills the slot of the shared editor palette.
export const fetchNoAreaStamp = (): Promise<MapAreaStamp> =>
    Promise.reject(new Error(AREA_MESSAGES.LOAD_FAILED));
