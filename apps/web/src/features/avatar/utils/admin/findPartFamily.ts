import type { AvatarPart } from "@standin/contracts";
import type { AvatarPartGroup } from "../../types/parts";

// The family whose base part has this id, or null when the list has none.
export const findPartFamily = (
    slots: readonly AvatarPartGroup[],
    partId: string
): AvatarPart | null => {
    for (const group of slots) {
        const family = group.parts.find((part) => part.id === partId);
        if (family) return family;
    }
    return null;
};
