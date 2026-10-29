import type { AvatarPart } from "@standin/contracts";

/** The row of the family that holds this color, never the base itself. */
export const pickCreatedVariation = (part: AvatarPart, colorKey: string) =>
    part.variations.find(
        (row) => row.basePartId !== null && row.colorKey === colorKey
    );
