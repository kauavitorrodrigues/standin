import {
    mapsTable,
    mapAssetsTable,
    spacesTable,
    mapTemplatesTable,
    deskAssignmentsTable,
    tilesetsTable,
} from "@standin/database";

// The layout is left out on purpose: it is large, so it is only read where
// the whole map is needed.
export const mapSelect = {
    id: mapsTable.id,
    width: mapsTable.width,
    height: mapsTable.height,
    tileSize: mapsTable.tileSize,
    sizeTier: mapsTable.sizeTier,
    layoutVersion: mapsTable.layoutVersion,
};

export const mapRenderSelect = {
    id: mapsTable.id,
    width: mapsTable.width,
    height: mapsTable.height,
    tileSize: mapsTable.tileSize,
    layoutVersion: mapsTable.layoutVersion,
    layout: mapsTable.layout,
};

export const mapResolvedSelect = {
    id: mapsTable.id,
    width: mapsTable.width,
    height: mapsTable.height,
    tileSize: mapsTable.tileSize,
    layout: mapsTable.layout,
};

export const mapLayoutSelect = {
    layout: mapsTable.layout,
    layoutVersion: mapsTable.layoutVersion,
    sizeTier: mapsTable.sizeTier,
};

export const mapLayoutOnlySelect = { layout: mapsTable.layout };

export const placedAssetSelect = {
    id: mapAssetsTable.id,
    assetId: mapAssetsTable.assetId,
    tileX: mapAssetsTable.tileX,
    tileY: mapAssetsTable.tileY,
    offsetX: mapAssetsTable.offsetX,
    offsetY: mapAssetsTable.offsetY,
    parentId: mapAssetsTable.parentId,
    propertyOverrides: mapAssetsTable.propertyOverrides,
};

export const mapOwnerSpaceSelect = {
    id: spacesTable.id,
    organizationId: spacesTable.organizationId,
};

export const mapOwnerTemplateSelect = {
    id: mapTemplatesTable.id,
    organizationId: mapTemplatesTable.organizationId,
};

export const mapDeskSelect = {
    mapAssetId: deskAssignmentsTable.mapAssetId,
    userId: deskAssignmentsTable.userId,
};

export const globalTilesetSelect = {
    id: tilesetsTable.id,
    tileCount: tilesetsTable.tileCount,
    tileMeta: tilesetsTable.tileMeta,
};

export const libraryTilesetSelect = {
    id: tilesetsTable.id,
    organizationId: tilesetsTable.organizationId,
    tileCount: tilesetsTable.tileCount,
    tileMeta: tilesetsTable.tileMeta,
};
