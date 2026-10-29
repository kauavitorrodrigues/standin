import type { SeedVariant } from "../types";

/** The data of a new variant. */
export const buildVariantCreateData = (entry: SeedVariant) => ({
    key: entry.key,
    color: entry.color,
    rotation: entry.rotation,
    footprint: entry.footprint,
    actionParams: entry.actionParams,
});
