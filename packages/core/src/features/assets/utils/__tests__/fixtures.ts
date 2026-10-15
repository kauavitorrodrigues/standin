import {
    ASSET_CATEGORIES,
    ASSET_PLACEMENTS,
    ASSET_TYPES,
} from "@standin/contracts";
import { encodePng } from "../../library/utils/encodePng";
import type { AssetRow } from "../../types";

/** A PNG of the given size, flat gray, for the byte level checks. */
export const pngOf = (width: number, height: number): Buffer =>
    encodePng(
        width,
        height,
        Array.from({ length: width * height }, () => [90, 90, 90, 255])
    );

/** A static 1x1 base asset row, with overrides. */
export const assetRow = (overrides: Partial<AssetRow> = {}): AssetRow => ({
    id: "mug-red",
    organizationId: null,
    baseAssetId: null,
    fileId: "file-mug-red",
    key: "mug-red",
    name: "Caneca",
    type: ASSET_TYPES.DECORATION,
    category: ASSET_CATEGORIES.FOOD_DRINK,
    rotation: null,
    colorKey: "red",
    colorHex: "#D64545",
    spriteW: 32,
    spriteH: 32,
    footprintW: 1,
    footprintH: 1,
    footprintOffsetX: 0,
    placement: ASSET_PLACEMENTS.SURFACE,
    surfaceHeightPx: 0,
    solid: false,
    action: null,
    actionParams: null,
    promptText: null,
    animation: null,
    fileName: "library/mug-red.png",
    ...overrides,
});

export const chairSeats = {
    seats: [{ dx: 16, dy: 8, facing: "DOWN" }],
};
