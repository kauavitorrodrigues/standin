import type { TileMeta } from "@standin/contracts";

// `blankDefault` and `material` do not change what a painted tile means.
const withoutBlankDefault = (entry: TileMeta[string]) => {
    const { blankDefault: _blankDefault, material: _material, ...rest } = entry;
    return JSON.stringify(
        Object.fromEntries(
            Object.entries(rest).sort(([a], [b]) => (a < b ? -1 : 1))
        )
    );
};

/**
 * Maps already painted with this image, so its `tileMeta` can only grow or
 * move `blankDefault`, or have a `material` set or changed. Changing or removing an entry would change what the
 * painted tiles mean.
 */
export const isTileMetaAppendOnly = (
    stored: TileMeta | null,
    next: TileMeta
): boolean =>
    Object.entries(stored ?? {}).every(([index, entry]) => {
        const replacement = next[index];
        return (
            replacement !== undefined &&
            withoutBlankDefault(replacement) === withoutBlankDefault(entry)
        );
    });
