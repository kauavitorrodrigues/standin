import type { SeedAvatarPart } from "../types";

/** The data of a new part. */
export const buildPartCreateData = (entry: SeedAvatarPart) => ({
    key: entry.key,
    name: entry.name,
    slot: entry.slot,
    colorKey: entry.colorKey,
    colorHex: entry.colorHex,
});
