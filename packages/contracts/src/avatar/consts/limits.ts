import { AVATAR_SLOTS } from "../enums/slots";
import type { AvatarSlot } from "../enums/slots";

const BYTES_IN_KB = 1024;

// Limit of one uploaded image of the avatar: a sheet (front, back or base) or
// a preview.
export const AVATAR_PART_MAX_BYTES = 256 * BYTES_IN_KB;

// Page size of the parts of a category in the editor.
export const AVATAR_PARTS_PAGE = { default: 24, max: 60 } as const;

// How many sheets the server assembles at the same time.
export const AVATAR_ASSEMBLY_CONCURRENCY = 2;

// Chance of each slot being filled by `randomAvatarConfig`, from 0 to 1.
export const AVATAR_RANDOM_CHANCE: Record<AvatarSlot, number> = {
    [AVATAR_SLOTS.SKIN]: 1,
    [AVATAR_SLOTS.HAIR]: 0.9,
    [AVATAR_SLOTS.FACIAL_HAIR]: 0.25,
    [AVATAR_SLOTS.TOP]: 0.9,
    [AVATAR_SLOTS.JACKET]: 0.3,
    [AVATAR_SLOTS.BOTTOM]: 0.9,
    [AVATAR_SLOTS.SHOES]: 0.8,
    [AVATAR_SLOTS.HAT]: 0.2,
    [AVATAR_SLOTS.GLASSES]: 0.25,
    [AVATAR_SLOTS.OTHER]: 0.15,
    [AVATAR_SLOTS.COSTUME]: 0.03,
};
