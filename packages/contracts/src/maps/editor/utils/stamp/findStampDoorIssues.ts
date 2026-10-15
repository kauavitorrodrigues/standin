import { ASSET_TYPES } from "../../../../assets/enums/asset-type";
import type { LibraryPalette } from "../../../../assets/types/library";
import { TILE_SIZE } from "../../../consts/constants";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import { findDoorRoom } from "../../../layout/findDoorRoom";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import { STAMP_ZONE_KINDS } from "../../consts/stamp-zone-kinds";
import type { Stamp } from "../../types/stamp";
import { buildStampRoomZone } from "../buildStampRoomZone";
import { getStampZoneKind } from "../getStampZoneKind";

/**
 * The door problems of a stamp. A stamp with doors has to be a room, and every
 * door has to stand on the border of the stamp rectangle, which is the border
 * of the room once it is placed. A stamp with no door has none.
 */
export const findStampDoorIssues = (
    stamp: Stamp,
    library: LibraryPalette
): LayoutIssue[] => {
    const assets = new Map(library.assets.map((asset) => [asset.id, asset]));
    const doors = stamp.objects.flatMap((object, index) => {
        const asset = assets.get(object.assetId);
        return asset?.type === ASSET_TYPES.DOOR
            ? [{ object, asset, index }]
            : [];
    });
    if (doors.length === 0) return [];

    if (getStampZoneKind(stamp) !== STAMP_ZONE_KINDS.PRIVATE) {
        return [
            createIssue(
                Code.STAMP_DOOR_NEEDS_ROOM,
                "stamp.zone",
                Messages.stampDoorNeedsRoom
            ),
        ];
    }

    const room = buildStampRoomZone({
        x: 0,
        y: 0,
        w: stamp.width,
        h: stamp.height,
    });

    return doors.flatMap(({ object, asset, index }) => {
        const width = asset.footprint.w * TILE_SIZE;
        const height = asset.footprint.h * TILE_SIZE;
        const match = findDoorRoom(
            {
                x: object.dx * TILE_SIZE + object.offsetX,
                y: (object.dy + 1) * TILE_SIZE + object.offsetY - height,
                width,
                height,
            },
            [room]
        );

        return match.status === "room"
            ? []
            : [
                  createIssue(
                      Code.STAMP_DOOR_OUTSIDE_ROOM,
                      `stamp.objects.${index}`,
                      Messages.stampDoorOutsideRoom
                  ),
              ];
    });
};
