export const VARIANT_EDITORS = {
    FOOTPRINT: "footprint",
    SEATS: "seats",
} as const;

export type VariantEditor =
    (typeof VARIANT_EDITORS)[keyof typeof VARIANT_EDITORS];
