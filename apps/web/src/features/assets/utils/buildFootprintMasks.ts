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

// The `mask` and `solidMask` keys of a footprint payload. Both go up as cells,
// four per tile per side. The footprint mask goes up for any still asset, and
// the collision mask only for one that blocks the way and differs from it.
export const buildFootprintMasks = ({
    w,
    h,
    offsetX,
    mask,
    solidMask,
    solid,
    isAnimated,
}: Params) => {
    const footprintMask = toPayloadMask(mask, isAnimated);
    const cells = toPayloadSolidMask({
        footprint: { w, h, offsetX },
        mask: footprintMask,
        solidMask,
        solid,
        isAnimated,
    });
    if (!cells) return buildMaskField(footprintMask);

    return { ...buildMaskField(footprintMask), solidMask: cells };
};
