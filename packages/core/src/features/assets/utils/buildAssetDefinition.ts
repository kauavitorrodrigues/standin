import type { AssetDefinition } from "@standin/contracts";
import type { AssetRow } from "../types";

/** The definition of a row, once its url is known. */
export const buildAssetDefinition = (
    row: AssetRow,
    url: string
): AssetDefinition => ({
    id: row.id,
    key: row.key,
    name: row.name,
    type: row.type,
    category: row.category,
    baseAssetId: row.baseAssetId,
    rotation: row.rotation,
    colorKey: row.colorKey,
    colorHex: row.colorHex,
    url,
    sprite: { w: row.spriteW, h: row.spriteH },
    footprint: {
        w: row.footprintW,
        h: row.footprintH,
        offsetX: row.footprintOffsetX,
    },
    placement: row.placement,
    surfaceHeightPx: row.surfaceHeightPx,
    solid: row.solid,
    action: row.action,
    actionParams: row.actionParams,
    promptText: row.promptText,
    animation: row.animation,
});
