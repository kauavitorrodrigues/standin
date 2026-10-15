import type { AssetCategory } from "../enums/asset-category";
import type { AssetDefinition } from "./index";

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
