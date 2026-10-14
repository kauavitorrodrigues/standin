import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import type { SelectionHost } from "@/features/editor/types/SelectionHost";
import type { ZoneRemoval } from "@/features/editor/types/zone-removal";
import { describeZoneFailure } from "@/features/editor/utils/describeZoneFailure";

type Params = {
    host: SelectionHost;
    zoneId: number;
};

// Removes a zone as ONE gesture. The draft refuses the last spawn
// (SPAWN_MISSING), and then the answer carries the reason in words.
export const removeZone = ({ host, zoneId }: Params): ZoneRemoval => {
    const result = host.dispatch([{ type: "remove_zone", zoneId }]);
    if (result.ok) return { removed: true };

    return {
        removed: false,
        reason: describeZoneFailure(result.errors, ZONE_MESSAGES.REMOVE_FAILED),
    };
};
