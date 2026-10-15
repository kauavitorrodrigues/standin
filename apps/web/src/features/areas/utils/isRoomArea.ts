import { STAMP_ZONE_KINDS } from "@standin/contracts";
import type { AreaComposerFormValues } from "../types/areaComposerForm";

// Whether the area is set to be a room, which is when its doors work. A room
// is a zone, so with no zone the area is not one.
export const isRoomArea = ({
    createZone,
    zoneKind,
}: Pick<AreaComposerFormValues, "createZone" | "zoneKind">): boolean =>
    createZone && zoneKind === STAMP_ZONE_KINDS.PRIVATE;
