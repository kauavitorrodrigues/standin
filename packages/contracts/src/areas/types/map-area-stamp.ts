import type { Stamp } from "../../maps/editor/types/stamp";

// What the map editor fetches to place one area.
export type MapAreaStamp = {
    id: string;
    name: string;
    stamp: Stamp;
    version: number;
};
