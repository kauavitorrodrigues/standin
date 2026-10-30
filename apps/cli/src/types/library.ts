import type { AreaSummary } from "@standin/contracts";
import type { RemoteArgs } from "./config";

export type LibraryListArgs = RemoteArgs;

export type LibraryTilesetRow = {
    id: string;
    key: string;
    name: string;
    tileCount: number;
};

export type LibraryAssetRow = {
    key: string;
    name: string;
    type: string;
    category: string;
    variantCount: number;
};

export type LibraryAreaRow = {
    id: string;
    name: string;
    width: number;
    height: number;
};

export type LibraryCategoryRow = {
    category: string;
    label: string;
    count: number;
};

export type LibraryListResult = {
    categories: LibraryCategoryRow[];
    tilesets: LibraryTilesetRow[];
    assets: LibraryAssetRow[];
    areas: LibraryAreaRow[];
};

// The answer of GET /library/areas.
export type AreaList = {
    areas: AreaSummary[];
};
