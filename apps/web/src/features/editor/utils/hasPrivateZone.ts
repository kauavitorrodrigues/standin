import { LAYOUT_ZONE_KINDS, type MapLayout } from "@standin/contracts";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";

// Whether the map has a room (a `private` zone) for a door to belong to.
export const hasPrivateZone = (layout: MapLayout): boolean =>
    getLayoutZones(layout).some(
        ({ kind }) => kind === LAYOUT_ZONE_KINDS.PRIVATE
    );
