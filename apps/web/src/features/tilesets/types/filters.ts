import type { LibraryTilesetProgress } from "@standin/contracts";

// What narrows down the list of tilesets. The server does the search and the
// filtering.
export type TilesetFilters = {
    search?: string;
    inUse?: boolean;
    progress?: LibraryTilesetProgress;
};
