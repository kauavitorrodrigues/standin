import { NAME_TAG } from "@/features/game/consts/name-tag";

// The name as the tag shows it: a long one is cut and ends with the ellipsis,
// so the whole stays within `NAME_TAG.MAX_CHARACTERS`.
export const truncateName = (name: string): string => {
    const trimmed = name.trim();
    const characters = Array.from(trimmed);
    if (characters.length <= NAME_TAG.MAX_CHARACTERS) return trimmed;

    const keep = NAME_TAG.MAX_CHARACTERS - NAME_TAG.ELLIPSIS.length;
    return characters.slice(0, keep).join("").trimEnd() + NAME_TAG.ELLIPSIS;
};
