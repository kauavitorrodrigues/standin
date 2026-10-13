import { assetsTable, filesTable } from "@standin/database";

// Rows are read with the storage key of their file, to build the url.
export const assetRowSelect = {
    id: assetsTable.id,
    organizationId: assetsTable.organizationId,
    baseAssetId: assetsTable.baseAssetId,
    fileId: assetsTable.fileId,
    key: assetsTable.key,
    name: assetsTable.name,
    type: assetsTable.type,
    category: assetsTable.category,
    rotation: assetsTable.rotation,
    colorKey: assetsTable.colorKey,
    colorHex: assetsTable.colorHex,
    spriteW: assetsTable.spriteW,
    spriteH: assetsTable.spriteH,
    footprintW: assetsTable.footprintW,
    footprintH: assetsTable.footprintH,
    footprintOffsetX: assetsTable.footprintOffsetX,
    placement: assetsTable.placement,
    surfaceHeightPx: assetsTable.surfaceHeightPx,
    solid: assetsTable.solid,
    action: assetsTable.action,
    actionParams: assetsTable.actionParams,
    promptText: assetsTable.promptText,
    animation: assetsTable.animation,
    fileName: filesTable.fileName,
};
