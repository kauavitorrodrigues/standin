import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneKind } from "@/features/editor/types/zone-kind";

// The hint for a rectangle below the minimum, in the words of its kind.
export const getTooSmallHint = (kind: ZoneKind): string => {
    switch (kind) {
        case ZONE_KINDS.ROOM:
            return ZONE_MESSAGES.ROOM_AREA_TOO_SMALL;
        default:
            return ZONE_MESSAGES.AREA_TOO_SMALL;
    }
};
