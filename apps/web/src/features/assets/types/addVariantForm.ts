import type { FootprintMaskValue, SolidMaskValue } from "./footprintMask";
import type { Seat } from "./seat";

export type AddVariantFormValues = {
    image: File[];
    colorKey: string;
    colorHex: string;
    // Empty is the piece without rotation.
    rotation: string;
    // Only sent for a rotation the family does not have yet.
    footprintW: number | undefined;
    footprintH: number | undefined;
    footprintOffsetX: number | undefined;
    footprintMask: FootprintMaskValue;
    footprintSolidMask: SolidMaskValue;
    // The params of the action of the base, only for a new rotation. Seats
    // are marked on the image, the target of a teleport is a map cell.
    seats: Seat[];
    targetX: number | undefined;
    targetY: number | undefined;
};
