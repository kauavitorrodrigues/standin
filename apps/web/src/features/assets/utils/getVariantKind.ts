import type { LibraryFamilyDetail } from "@standin/contracts";
import { NO_ROTATION } from "../consts/rotationMeta";

export const VARIANT_KINDS = {
    COLOR: "COLOR",
    ROTATION: "ROTATION",
} as const;

export type VariantKind = (typeof VARIANT_KINDS)[keyof typeof VARIANT_KINDS];

// A new color goes on a rotation the family already has. Any other rotation
// is new, and needs its own footprint.
export const getVariantKind = (
    family: Pick<LibraryFamilyDetail, "variants">,
    rotation: string
): VariantKind => {
    const existing = new Set<string>(
        family.variants.map((variant) => variant.rotation ?? NO_ROTATION)
    );
    return existing.has(rotation)
        ? VARIANT_KINDS.COLOR
        : VARIANT_KINDS.ROTATION;
};
