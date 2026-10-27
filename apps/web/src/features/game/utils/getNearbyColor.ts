import { NEARBY_PALETTE } from "@/features/game/consts/nearby";

// The color of a person in the bubble and in the list: the string hash
// (`h = (h << 5) - h + code`) over the palette, so it is the same for the same
// id everywhere.
export const getNearbyColor = (userId: string): string => {
    let hash = 0;
    for (let index = 0; index < userId.length; index += 1) {
        hash = ((hash << 5) - hash + userId.charCodeAt(index)) | 0;
    }

    return NEARBY_PALETTE[Math.abs(hash) % NEARBY_PALETTE.length];
};
