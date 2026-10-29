import type { SeedAvatarPart, SeedPartChanges } from "../types";

/** Only the fields that changed. */
export const buildPartUpdateBody = (
    entry: SeedAvatarPart,
    { nameChanged, colorChanged }: SeedPartChanges
) => ({
    ...(nameChanged ? { name: entry.name } : {}),
    ...(colorChanged
        ? { colorKey: entry.colorKey, colorHex: entry.colorHex }
        : {}),
});
