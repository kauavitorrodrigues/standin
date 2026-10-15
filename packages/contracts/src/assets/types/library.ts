import type { AssetCategory } from "../enums/asset-category";
import type { TileMeta } from "../schemas/tile-meta.schema";
import type { AssetDefinition, Tileset } from "./index";

export type LibraryTilesetSummary = {
    id: string;
    key: string;
    name: string;
    url: string;
    widthPx: number;
    heightPx: number;
    tileCount: number;
    columns: number;
    // How many tiles already have a category in their `tileMeta`.
    taggedCount: number;
    // The share of the tiles with a category, from 0 to 100.
    progressPercent: number;
    inUse: boolean;
};

// Options of each filter of the tilesets, counted over every tileset of the
// scope, whatever the filters chosen on the list.
export type LibraryTilesetFacets = {
    usage: LibraryFacetOption[];
    progress: LibraryFacetOption[];
};

export type LibraryTilesetList = {
    tilesets: LibraryTilesetSummary[];
    total: number;
    facets: LibraryTilesetFacets;
};

export type LibraryTilesetDetail = LibraryTilesetSummary & {
    margin: number;
    spacing: number;
    tileMeta: TileMeta | null;
};

export type LibraryAssetPart = {
    partAssetId: string;
    offsetX: number;
    offsetY: number;
};

// One row of a family as the admin library serves it.
export type LibraryAsset = AssetDefinition & {
    inUse: boolean;
    parts: LibraryAssetPart[];
};

// A palette tab, ready to render: label, icon and order come from the
// category meta, and `families` are the base assets sorted by name.
export type LibraryPaletteCategory = {
    category: AssetCategory;
    label: string;
    icon: string;
    order: number;
    families: AssetDefinition[];
};

// One area as the palette lists it. The stamp is fetched when placing.
export type LibraryPaletteArea = {
    id: string;
    name: string;
    // Size in tiles.
    width: number;
    height: number;
    objectCount: number;
    thumbnailUrl: string;
    // The area version, as a timestamp in milliseconds.
    version: number;
};

export type LibraryPalette = {
    tilesets: Tileset[];
    assets: AssetDefinition[];
    // Only the categories that have at least one family, in tab order.
    categories: LibraryPaletteCategory[];
    areas: LibraryPaletteArea[];
};

// What a card of the library shows: one family, already grouped and counted.
// The thumbnail is the whole PNG of the base asset. For an animated base the
// PNG is a strip of `frameCount` frames of `sprite` size.
export type LibraryFamilyThumbnail = {
    url: string;
    sprite: { w: number; h: number };
    frameCount: number;
};

export type LibraryFamilySummary = {
    // Id of the base asset, which identifies the family.
    familyId: string;
    key: string;
    name: string;
    type: AssetDefinition["type"];
    category: AssetCategory;
    placement: AssetDefinition["placement"];
    footprint: AssetDefinition["footprint"];
    thumbnail: LibraryFamilyThumbnail;
    // Rows of the family, base included.
    variantCount: number;
    colorCount: number;
    rotationCount: number;
    inUse: boolean;
    hasParts: boolean;
};

export type LibraryFacetOption = {
    value: string;
    label: string;
    count: number;
};

// Options of each filter with how many families each would leave, counted
// with the other filters applied.
export type LibraryFamilyFacets = {
    types: LibraryFacetOption[];
    categories: LibraryFacetOption[];
    placements: LibraryFacetOption[];
    usage: LibraryFacetOption[];
};

// One entry of the library sidebar: a category with how many families it
// holds. Only categories with at least one family, in tab order.
export type LibraryOverviewGroup = {
    category: AssetCategory;
    label: string;
    icon: string;
    order: number;
    count: number;
};

export type LibraryOverview = {
    groups: LibraryOverviewGroup[];
    total: number;
};

export type LibraryFamilyList = {
    families: LibraryFamilySummary[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type LibraryFamilyVariant = LibraryAsset & {
    thumbnail: LibraryFamilyThumbnail;
};

// One row of the color by rotation grid. `cells` follows the columns of the
// grid, and a cell is null where the family has no such combination.
export type LibraryFamilyGridRow = {
    color: { key: string; hex: string } | null;
    cells: (LibraryFamilyVariant | null)[];
};

// Variations laid out by color (rows) and rotation (columns), ready to
// render. A null column stands for the rows that have no rotation.
export type LibraryFamilyGrid = {
    columns: AssetDefinition["rotation"][];
    rows: LibraryFamilyGridRow[];
};

export type LibraryFamilyDetail = LibraryFamilySummary & {
    colors: { key: string; hex: string }[];
    rotations: NonNullable<AssetDefinition["rotation"]>[];
    variants: LibraryFamilyVariant[];
    grid: LibraryFamilyGrid;
};
