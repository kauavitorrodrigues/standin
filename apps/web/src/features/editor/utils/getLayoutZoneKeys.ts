import type { MapLayout } from "@standin/contracts";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";

// The keys of the zones the layout has.
export const getLayoutZoneKeys = (layout: MapLayout): string[] =>
    getLayoutZones(layout).flatMap(({ key }) =>
        key === undefined ? [] : [key]
    );
