import type { SeedAvatarPart, SeedPartChanges } from "../types";

/** What of a part differs from its entry. */
export const diffAvatarPart = (
    entry: SeedAvatarPart,
    current: { name: string; colorKey: string | null; colorHex: string | null }
): SeedPartChanges => ({
    nameChanged: entry.name !== current.name,
    // The color pair is compared only when the entry states it.
    colorChanged:
        entry.colorKey !== undefined &&
        entry.colorHex !== undefined &&
        (entry.colorKey !== current.colorKey ||
            entry.colorHex !== current.colorHex),
});
