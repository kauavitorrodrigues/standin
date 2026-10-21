import { NEARBY_HISTORY_KEY_PREFIX } from "@/features/game/consts/nearby";

export const getNearbyHistoryKey = (spaceId: string, userId: string): string =>
    `${NEARBY_HISTORY_KEY_PREFIX}:${spaceId}:${userId}`;
