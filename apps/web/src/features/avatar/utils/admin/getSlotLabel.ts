import { AVATAR_SLOTS } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";

// The name of a slot as the tabs of the editor show it.
export const getSlotLabel = (slot: AvatarSlot): string => {
    switch (slot) {
        case AVATAR_SLOTS.SKIN:
            return "Pele";
        case AVATAR_SLOTS.HAIR:
            return "Cabelo";
        case AVATAR_SLOTS.FACIAL_HAIR:
            return "Barba";
        case AVATAR_SLOTS.TOP:
            return "Camiseta";
        case AVATAR_SLOTS.JACKET:
            return "Jaqueta";
        case AVATAR_SLOTS.BOTTOM:
            return "Calça";
        case AVATAR_SLOTS.SHOES:
            return "Sapato";
        case AVATAR_SLOTS.HAT:
            return "Chapéu";
        case AVATAR_SLOTS.GLASSES:
            return "Óculos";
        case AVATAR_SLOTS.OTHER:
            return "Outros";
        case AVATAR_SLOTS.COSTUME:
            return "Fantasia";
    }
};
