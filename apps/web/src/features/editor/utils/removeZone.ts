import { LAYOUT_ZONE_KINDS } from "@standin/contracts";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import type { SelectionHost } from "@/features/editor/types/SelectionHost";
import type { ZoneRemoval } from "@/features/editor/types/zone-removal";
import { describeZoneFailure } from "@/features/editor/utils/describeZoneFailure";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { getRoomDoorIds } from "@/features/editor/utils/getRoomDoorIds";

type Params = {
    host: SelectionHost;
    zoneId: number;
};

// Removes a zone as ONE gesture. The draft refuses the last spawn
// (SPAWN_MISSING), and then the answer carries the reason in words. A room
// with doors is refused here, so no door is left without its room.
export const removeZone = ({ host, zoneId }: Params): ZoneRemoval => {
    if (hasDoors(host, zoneId)) {
        return { removed: false, reason: ZONE_MESSAGES.ROOM_HAS_DOORS };
    }

    const result = host.dispatch([{ type: "remove_zone", zoneId }]);
    if (result.ok) return { removed: true };

    return {
        removed: false,
        reason: describeZoneFailure(result.errors, ZONE_MESSAGES.REMOVE_FAILED),
    };
};

const hasDoors = (host: SelectionHost, zoneId: number): boolean => {
    const model = host.getModel();
    const zone = getLayoutZones(model.layout).find(({ id }) => id === zoneId);
    if (zone?.kind !== LAYOUT_ZONE_KINDS.PRIVATE) return false;
    if (zone.key === undefined) return false;

    return getRoomDoorIds(model, zone.key).length > 0;
};
