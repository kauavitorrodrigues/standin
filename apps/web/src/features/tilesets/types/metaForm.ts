import type { TileMeta } from "@standin/contracts";

// `selectedIndex` only drives the inspector, it is never sent.
export type TileMetaFormValues = {
    tileMeta: TileMeta;
    selectedIndex: number;
};
