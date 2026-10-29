import {
    ASSET_TYPES,
    LAYOUT_LAYER_NAMES,
    LAYOUT_ZONE_KINDS,
    getDoorFamily,
    getDoorSizeBySide,
    getLayoutZones,
    pickDoorVariantForSide,
    replayOps,
} from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { fail } from "../internal/fail";
import { resolveTempIds } from "../internal/tempIds";
import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import { createLibraryIndex } from "../library/createLibraryIndex";
import type { BuildOptions, BuildResult, PlaceDoorParams } from "../types";
import { findDoorSlot } from "./door/findDoorSlot";
import { planDoorGap } from "./door/planDoorGap";

/**
 * A door in the wall of a room: opens a gap in the wall where the door goes,
 * finds the slot with the shared `findDoorSlots` and places the variant of the
 * door family that fits the side. A door must stand on the border of exactly
 * one room, which the whole draft is checked for at the end (see validateOps).
 */
export const placeDoor = (
    model: EditorModel,
    { room, side, door, offset }: PlaceDoorParams,
    options?: BuildOptions
): BuildResult => {
    const resolved = createLibraryIndex(model.library).asset(door);
    if (!resolved.ok) return fail(resolved.issue);
    if (resolved.value.type !== ASSET_TYPES.DOOR) {
        return fail(
            createIssue(
                AUTHORING_ISSUE_CODES.WRONG_ASSET_TYPE,
                `library.assets.${door}`,
                { key: door, expected: ASSET_TYPES.DOOR }
            )
        );
    }

    const zone = getLayoutZones(model.layout).find(
        (candidate) =>
            candidate.kind === LAYOUT_ZONE_KINDS.PRIVATE &&
            candidate.key === room
    );
    if (!zone) {
        return fail(
            createIssue(AUTHORING_ISSUE_CODES.ROOM_NOT_FOUND, `rooms.${room}`, {
                room,
            })
        );
    }

    const family = getDoorFamily(model.library.assets, resolved.value.id);
    const sizeBySide = getDoorSizeBySide(family);
    const pick = pickDoorVariantForSide(family, side);
    if (!sizeBySide || !pick) {
        return fail(
            createIssue(
                AUTHORING_ISSUE_CODES.DOOR_NO_SLOT,
                `library.assets.${door}`,
                { reason: "NO_VARIANT" }
            )
        );
    }

    const gap = planDoorGap(zone, side, sizeBySide[side], offset);
    const erase: EditorOp = {
        type: "erase",
        layer: LAYOUT_LAYER_NAMES.WALLS,
        cells: gap.cells,
    };
    const opened = replayOps(model, [erase]);
    // The erase is refused for the same reason the server would refuse it.
    if (!opened.ok) return checkOps(model, [erase]);

    const slot = findDoorSlot(opened.model, zone, side, sizeBySide, gap);
    if (!slot) {
        return fail(
            createIssue(
                AUTHORING_ISSUE_CODES.DOOR_NO_SLOT,
                `rooms.${room}.${side}`,
                { reason: "NO_GAP" }
            )
        );
    }

    return checkOps(model, [
        erase,
        {
            type: "place_asset",
            tempId: resolveTempIds(model, options)(),
            assetId: pick.variant.id,
            tileX: slot.tileX,
            tileY: slot.tileY,
        },
    ]);
};
