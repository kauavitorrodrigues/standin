import type { PlacedSlice } from "@/features/game/utils/buildPlacedSlices";

// The depth the sprite is drawn with at a row of px counted from its top: the
// depth of the strip that holds the row, or the one of the whole sprite. The
// last strip answers for a row below all of them.
export const getSliceDepthAt = (
    slices: readonly PlacedSlice[],
    spriteY: number,
    fallback: number
): number => {
    const strip = slices.find(
        ({ crop }) =>
            crop !== null && spriteY >= crop.y && spriteY < crop.y + crop.height
    );
    if (strip) return strip.depth;

    const whole = slices.find(({ crop }) => crop === null);
    return whole?.depth ?? slices[slices.length - 1]?.depth ?? fallback;
};
