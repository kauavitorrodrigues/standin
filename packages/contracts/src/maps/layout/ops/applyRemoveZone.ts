import {
    LAYOUT_ZONES_LAYER_NAME,
    LAYOUT_ZONE_KINDS,
    type MapLayout,
} from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { RemoveZoneOp } from "./types";
import { isZoneObject, objectToZone } from "../zone";
import { findZonesGroup } from "./findZonesGroup";

export const applyRemoveZone = (
    layout: MapLayout,
    op: RemoveZoneOp
): LayoutIssue[] => {
    const group = findZonesGroup(layout);
    if (!group) return [];

    group.objects = group.objects.filter((object) => object.id !== op.zoneId);

    const hasSpawn = group.objects.some(
        (object) =>
            isZoneObject(object) &&
            objectToZone(object).kind === LAYOUT_ZONE_KINDS.SPAWN
    );
    if (hasSpawn) return [];

    return [
        createIssue(
            Code.SPAWN_MISSING,
            LAYOUT_ZONES_LAYER_NAME,
            Messages.spawnMissing
        ),
    ];
};
