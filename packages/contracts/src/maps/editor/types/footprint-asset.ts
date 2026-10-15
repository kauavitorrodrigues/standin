import type { FootprintMask } from "../../../assets/types/footprint-mask";

export type FootprintAsset = {
    footprint: { w: number; h: number; mask?: FootprintMask | null };
};
