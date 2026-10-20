import type { AvatarPartRow } from "@standin/contracts";

// Only a base part that has a color of its own takes variations, because the
// color of the base is the first swatch of the family.
export const canAddVariation = (row: AvatarPartRow): boolean =>
    row.basePartId === null && row.colorKey !== null;
