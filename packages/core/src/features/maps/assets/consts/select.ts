import {
    mapsTable,
    mapAssetsTable,
    assetsTable,
    assetPartsTable,
    deskAssignmentsTable,
} from "@standin/database";

// A placed object together with the definition of its asset, which is what
// every position check needs.
export const mapAssetItemSelect = {
    rowId: mapAssetsTable.id,
    assetId: mapAssetsTable.assetId,
    tileX: mapAssetsTable.tileX,
    tileY: mapAssetsTable.tileY,
    offsetX: mapAssetsTable.offsetX,
    offsetY: mapAssetsTable.offsetY,
    parentId: mapAssetsTable.parentId,
    id: assetsTable.id,
    baseAssetId: assetsTable.baseAssetId,
    rotation: assetsTable.rotation,
    colorKey: assetsTable.colorKey,
    type: assetsTable.type,
    placement: assetsTable.placement,
    footprintW: assetsTable.footprintW,
    footprintH: assetsTable.footprintH,
};

export const mapAssetDefSelect = {
    id: assetsTable.id,
    baseAssetId: assetsTable.baseAssetId,
    rotation: assetsTable.rotation,
    colorKey: assetsTable.colorKey,
    type: assetsTable.type,
    placement: assetsTable.placement,
    footprintW: assetsTable.footprintW,
    footprintH: assetsTable.footprintH,
};

// What the position checks need from the map: its size and its layout.
export const mapInfoSelect = {
    id: mapsTable.id,
    width: mapsTable.width,
    height: mapsTable.height,
    layout: mapsTable.layout,
};

export const deskOwnerSelect = {
    id: deskAssignmentsTable.id,
    userId: deskAssignmentsTable.userId,
};

export const bundlePartSelect = {
    partAssetId: assetPartsTable.partAssetId,
    offsetX: assetPartsTable.offsetX,
    offsetY: assetPartsTable.offsetY,
};

export const lockedRowSelect = { id: mapAssetsTable.id };
