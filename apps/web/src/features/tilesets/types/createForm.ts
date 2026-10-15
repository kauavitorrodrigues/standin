import type { TileMeta } from "@standin/contracts";

export type CreateTilesetFormValues = {
    image: File[];
    name: string;
    margin: number | undefined;
    spacing: number | undefined;
    // The category of each tile, marked on the sheet. Empty to send it later.
    tileMeta: TileMeta;
};
