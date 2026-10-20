export const AVATAR_SLOTS = {
    SKIN: "SKIN",
    HAIR: "HAIR",
    FACIAL_HAIR: "FACIAL_HAIR",
    TOP: "TOP",
    JACKET: "JACKET",
    BOTTOM: "BOTTOM",
    SHOES: "SHOES",
    HAT: "HAT",
    GLASSES: "GLASSES",
    OTHER: "OTHER",
    COSTUME: "COSTUME",
} as const;

export type AvatarSlot = (typeof AVATAR_SLOTS)[keyof typeof AVATAR_SLOTS];

export const AVATAR_SLOT_VALUES = Object.values(AVATAR_SLOTS);
