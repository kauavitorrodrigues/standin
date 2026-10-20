import {
    AVATAR_SHEET_PX,
    assembleSheet,
    orderLayers,
} from "@standin/contracts";
import type { AvatarPartSheets } from "@standin/contracts";
import { encodeRgbaPng } from "../../../lib/encodeRgbaPng";

/**
 * Stacks the decoded sheets of the chosen parts (the base first, then the
 * sheets in slot order, with the costume rule that leaves the base out) and
 * encodes the result as a PNG. The same parts always give the same bytes.
 */
export const assembleSheetPng = (
    parts: readonly AvatarPartSheets<Uint8Array>[],
    base: Uint8Array | null = null
): Buffer => {
    const layers = orderLayers(parts, base).map(({ sheet }) => ({
        rgba: sheet,
    }));
    const rgba = assembleSheet(layers);
    return encodeRgbaPng(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, rgba);
};
