import {
    deriveTileMask,
    isFootprintSolidMaskFitting,
} from "@standin/contracts";
import type {
    FootprintMaskValue,
    SolidMaskValue,
} from "../types/footprintMask";
import { buildMaskField, toPayloadMask } from "./footprintMask";
import { toPayloadSolidMask } from "./solidMask";

type Params = {
    w: number;
    h: number;
    offsetX: number;
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
    solid: boolean;
    isAnimated: boolean;
};

// The `mask` and `solidMask` keys of a footprint payload. The collision mask
// only goes up for a still asset that blocks the way. If the tile mask would
// leave free a tile that holds a solid cell, the tile mask is worked out from
// the cells, so the API never gets two masks that disagree.
export const buildFootprintMasks = ({
    w,
    h,
    offsetX,
    mask,
    solidMask,
    solid,
    isAnimated,
}: Params) => {
    const tileMask = toPayloadMask(mask, isAnimated);
    const cells = toPayloadSolidMask({
        footprint: { w, h, offsetX },
        mask: tileMask,
        solidMask,
        solid,
        isAnimated,
    });
    if (!cells) return buildMaskField(tileMask);

    const fits = isFootprintSolidMaskFitting({
        w,
        h,
        mask: tileMask,
        solidMask: cells,
    });
    const safeMask = fits ? tileMask : deriveTileMask(cells, w, h);
    return { ...buildMaskField(safeMask), solidMask: cells };
};
