import { ASSET_TYPES } from "../../../assets/enums/asset-type";
import { TILE_SIZE } from "../../consts/constants";
import { findDoorRoom } from "../../layout/findDoorRoom";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../layout/issues";
import { findZonesGroup } from "../../layout/ops/findZonesGroup";
import { isZoneObject, objectToZone } from "../../layout/zone";
import type { EditorModel } from "../types/editor-model";

/**
 * Every placed door must stand on the border of exactly one private zone.
 * The footprint is read like the rest of the editor: `tileY` is the bottom
 * cell, the bottom edge is `(tileY + 1) * TILE_SIZE` plus the offset.
 */
export const validateDoors = (model: EditorModel): LayoutIssue[] => {
    const assets = new Map(model.library.assets.map((a) => [a.id, a]));
    const zones = (findZonesGroup(model.layout)?.objects ?? [])
        .filter(isZoneObject)
        .map(objectToZone);
    const issues: LayoutIssue[] = [];

    for (const placed of model.placed) {
        const asset = assets.get(placed.assetId);
        if (asset?.type !== ASSET_TYPES.DOOR) continue;

        const width = asset.footprint.w * TILE_SIZE;
        const height = asset.footprint.h * TILE_SIZE;
        const match = findDoorRoom(
            {
                x: placed.tileX * TILE_SIZE + placed.offsetX,
                y: (placed.tileY + 1) * TILE_SIZE + placed.offsetY - height,
                width,
                height,
            },
            zones
        );
        const path = `placed.${placed.id}`;

        switch (match.status) {
            case "none":
                issues.push(
                    createIssue(
                        Code.DOOR_OUTSIDE_PRIVATE_ZONE,
                        path,
                        Messages.doorOutsidePrivateZone
                    )
                );
                break;
            case "ambiguous":
                issues.push(
                    createIssue(
                        Code.DOOR_BETWEEN_ROOMS,
                        path,
                        Messages.doorBetweenRooms
                    )
                );
                break;
            case "room":
                break;
        }
    }

    return issues;
};
