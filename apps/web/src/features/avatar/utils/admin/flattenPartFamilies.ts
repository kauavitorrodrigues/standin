import type { AvatarPart, AvatarPartGroup } from "@standin/contracts";

// Every part over every slot, one entry per family. The colors of a part stay
// inside it, in `variations`, so the grid shows one card per part.
export const flattenPartFamilies = (slots: AvatarPartGroup[]): AvatarPart[] =>
    slots.flatMap((group) => group.parts);
