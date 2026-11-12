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

// Slots a random avatar always draws again. The rest keep what the person has
// unless they win the extra chance. COSTUME is never drawn.
export const AVATAR_RANDOM_ESSENTIAL_SLOTS: readonly AvatarSlot[] = [
    AVATAR_SLOTS.SKIN,
    AVATAR_SLOTS.HAIR,
    AVATAR_SLOTS.TOP,
    AVATAR_SLOTS.BOTTOM,
    AVATAR_SLOTS.SHOES,
];

// Chance, from 0 to 1, that a slot that is not essential is drawn again.
export const AVATAR_RANDOM_EXTRA_CHANCE = 0.25;
