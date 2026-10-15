import type { ZoneInput } from "@standin/contracts";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneKind } from "@/features/editor/types/zone-kind";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { createRoomKey } from "@/features/editor/utils/createRoomKey";

type Params = {
    kind: ZoneKind;
    rect: ZoneRect;
    label: string;
    // The keys the map already has, so a new room gets one of its own.
    takenKeys: readonly string[];
};

// The new zone the user just named. A room also gets a generated key.
export const buildNamedZone = ({
    kind,
    rect,
    label,
    takenKeys,
}: Params): ZoneInput => {
    switch (kind) {
        case ZONE_KINDS.ROOM:
            return {
                kind,
                rect,
                label,
                key: createRoomKey({ taken: takenKeys }),
            };
        default:
            return { kind: ZONE_KINDS.AREA, rect, label };
    }
};
