import type { MapLayout } from "../../schemas/layout.schema";
import type { LayoutIssue } from "../issues";
import type { SetZoneOp } from "./types";
import { validateZoneRules } from "../validators/validateZoneRules";
import { zoneToObject } from "../zone";
import { findZonesGroup } from "./findZonesGroup";

export const applySetZone = (
    layout: MapLayout,
    op: SetZoneOp
): LayoutIssue[] => {
    const group = findZonesGroup(layout);
    if (!group) return [];

    const id = op.zone.id ?? layout.nextobjectid ?? 1;
    if (op.zone.id === undefined) layout.nextobjectid = id + 1;

    const object = zoneToObject({ ...op.zone, id }, id);
    const existing = group.objects.findIndex((item) => item.id === id);
    if (existing >= 0) group.objects[existing] = object;
    else group.objects.push(object);

    return validateZoneRules(layout);
};
