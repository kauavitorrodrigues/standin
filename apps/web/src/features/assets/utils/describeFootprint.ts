import type {
    FootprintMaskValue,
    SolidMaskValue,
} from "../types/footprintMask";
import type { Footprint } from "../types/spriteGeometry";
import { countOccupiedTiles, toPayloadMask } from "./footprintMask";
import { countSolidCells, toPayloadSolidMask } from "./solidMask";

// The footprint in words for the summary. With a mask it also says how many
// tiles are occupied, and with a collision mask how many cells block.
export const describeFootprint = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    solidMask: SolidMaskValue = null
): string => {
    const parts = [`${footprint.w} × ${footprint.h} tiles`];
    if (mask) {
        parts.push(`${countOccupiedTiles(footprint, mask)} ocupados`);
    }
    if (solidMask) {
        parts.push(`${countSolidCells(solidMask)} células sólidas`);
    }
    parts.push(`deslocamento ${footprint.offsetX}`);
    return parts.join(", ");
};

type FootprintValues = {
    footprintW?: number;
    footprintH?: number;
    footprintOffsetX?: number;
    footprintMask?: FootprintMaskValue;
    footprintSolidMask?: SolidMaskValue;
    solid?: boolean;
    isAnimated?: boolean;
};

// The footprint row of the summary of the form: nothing is said until the crop
// is marked, because the footprint lives inside it.
export const describeFormFootprint = (
    hasCrop: boolean,
    values: FootprintValues
): string => {
    if (!hasCrop || !values.footprintW || !values.footprintH) {
        return "Ainda não marcado";
    }
    const footprint = {
        w: values.footprintW ?? 1,
        h: values.footprintH ?? 1,
        offsetX: values.footprintOffsetX ?? 0,
    };
    const isAnimated = values.isAnimated ?? false;
    const mask = toPayloadMask(values.footprintMask ?? null, isAnimated);
    const solidMask = toPayloadSolidMask({
        footprint,
        mask,
        solidMask: values.footprintSolidMask ?? null,
        solid: values.solid ?? false,
        isAnimated,
    });
    return describeFootprint(footprint, mask, solidMask);
};
