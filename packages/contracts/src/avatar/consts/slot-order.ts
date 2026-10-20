import { AVATAR_SLOTS } from "../enums/slots";
import type { AvatarSlot } from "../enums/slots";

// Order in which the sheets are drawn, from bottom to top. COSTUME is not
// here because it replaces everything else.
export const AVATAR_SLOT_ORDER = [
    AVATAR_SLOTS.SKIN,
    AVATAR_SLOTS.BOTTOM,
    AVATAR_SLOTS.SHOES,
    AVATAR_SLOTS.TOP,
    AVATAR_SLOTS.JACKET,
    AVATAR_SLOTS.FACIAL_HAIR,
    AVATAR_SLOTS.HAIR,
    AVATAR_SLOTS.GLASSES,
    AVATAR_SLOTS.HAT,
    AVATAR_SLOTS.OTHER,
] as const;

// Order of the tabs of the editor. It is not the drawing order.
export const AVATAR_SLOT_TABS: readonly AvatarSlot[] = [
    AVATAR_SLOTS.SKIN,
    AVATAR_SLOTS.HAIR,
    AVATAR_SLOTS.FACIAL_HAIR,
    AVATAR_SLOTS.TOP,
    AVATAR_SLOTS.JACKET,
    AVATAR_SLOTS.BOTTOM,
    AVATAR_SLOTS.SHOES,
    AVATAR_SLOTS.HAT,
    AVATAR_SLOTS.GLASSES,
    AVATAR_SLOTS.OTHER,
    AVATAR_SLOTS.COSTUME,
];
