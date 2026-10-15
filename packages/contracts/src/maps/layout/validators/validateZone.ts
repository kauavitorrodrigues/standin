import { LAYOUT_ZONE_KINDS } from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { MIN_POLYGON_POINTS } from "../consts/thresholds";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { Zone } from "../zone";

const ZONE_KINDS: string[] = Object.values(LAYOUT_ZONE_KINDS);

/** Rules of a single zone. `seenKeys` carries the keys of the zones before it. */
export const validateZone = (
    zone: Zone,
    seenKeys: Set<string>
): LayoutIssue[] => {
    const errors: LayoutIssue[] = [];
    const path = `zones.${zone.id ?? zone.name ?? zone.kind}`;

    if (!ZONE_KINDS.includes(zone.kind)) {
        return [
            createIssue(Code.ZONE_KIND_INVALID, path, Messages.zoneKindInvalid),
        ];
    }

    const needsLabel =
        zone.kind === LAYOUT_ZONE_KINDS.AREA ||
        zone.kind === LAYOUT_ZONE_KINDS.PRIVATE;
    if (needsLabel && !zone.label) {
        errors.push(
            createIssue(
                Code.ZONE_LABEL_REQUIRED,
                path,
                Messages.zoneLabelRequired
            )
        );
    }

    if (zone.kind === LAYOUT_ZONE_KINDS.PRIVATE && !zone.key) {
        errors.push(
            createIssue(Code.ZONE_KEY_REQUIRED, path, Messages.zoneKeyRequired)
        );
    }

    if (zone.key) {
        if (seenKeys.has(zone.key)) {
            errors.push(
                createIssue(
                    Code.ZONE_KEY_DUPLICATED,
                    path,
                    Messages.zoneKeyDuplicated
                )
            );
        }
        seenKeys.add(zone.key);
    }

    if (zone.polygon && zone.polygon.length < MIN_POLYGON_POINTS) {
        errors.push(
            createIssue(
                Code.ZONE_POLYGON_INVALID,
                path,
                Messages.zonePolygonInvalid
            )
        );
    }

    if ((zone.rotation ?? 0) !== 0) {
        errors.push(createIssue(Code.ZONE_ROTATED, path, Messages.zoneRotated));
    }

    return errors;
};
