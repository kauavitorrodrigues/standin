import { describe, expect, it } from "vitest";
import {
    buildStampRoomZone,
    LAYOUT_ZONES_LAYER_NAME,
    TILE_SIZE,
    TILED_LAYER_TYPES,
    type AssetDefinition,
    type EditorModel,
    type MapLayout,
} from "@standin/contracts";
import {
    DOOR_MESSAGES,
    PLACEMENT_MESSAGES,
    ZONE_MESSAGES,
} from "@/features/editor/consts/messages";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";
import { getDoorPaletteReason } from "@/features/editor/utils/getDoorPaletteReason";
import { planMove } from "@/features/editor/utils/planMove";
import { planPlacement } from "@/features/editor/utils/planPlacement";
import { removeZone } from "@/features/editor/utils/removeZone";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const door = {
    id: "door",
    type: "DOOR",
    placement: "GROUND",
    footprint: { w: 1, h: 1, offsetX: 0 },
    surfaceHeightPx: 0,
} as unknown as AssetDefinition;

const zoneObject = (id: number, kind: string, key: string, x: number) => ({
    id,
    name: key,
    type: kind,
    x: x * TILE_SIZE,
    y: 2 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 4 * TILE_SIZE,
    properties: [
        { name: "kind", type: "string", value: kind },
        { name: "key", type: "string", value: key },
        { name: "label", type: "string", value: key },
    ],
});

const withZones = (
    objects: unknown[],
    placed = [placedAt("d1", "door", 4, 3)]
) => {
    const base = buildModel(placed);
    const layout = {
        ...base.layout,
        layers: [
            {
                type: TILED_LAYER_TYPES.OBJECT_GROUP,
                name: LAYOUT_ZONES_LAYER_NAME,
                objects,
            },
        ],
    } as unknown as MapLayout;
    return {
        ...base,
        layout,
        library: {
            ...base.library,
            assets: [...base.library.assets, door],
        },
    } as EditorModel;
};

const room = withZones([zoneObject(1, "private", "room-a", 0)]);
const noRoom = withZones([zoneObject(1, "area", "area-a", 0)]);

describe("door placement rule", () => {
    it("accepts a door on the border of a private zone", () => {
        const plan = planPlacement(room, "door", [5, 3]);
        expect(plan.result).toEqual({ ok: true });
    });

    it("refuses a door far from any private zone", () => {
        const plan = planPlacement(room, "door", [9, 9]);
        expect(plan.result).toEqual({
            ok: false,
            reason: "DOOR_OUTSIDE_PRIVATE_ZONE",
        });
        expect(describePlacementReason("DOOR_OUTSIDE_PRIVATE_ZONE")).toBe(
            PLACEMENT_MESSAGES.DOOR_OUTSIDE_ROOM
        );
    });

    it("refuses a door when the map only has other kinds of zone", () => {
        const plan = planPlacement(noRoom, "door", [5, 3]);
        expect(plan.result.ok).toBe(false);
    });

    it("does not touch other assets", () => {
        expect(planPlacement(noRoom, "crate", [9, 9]).result).toEqual({
            ok: true,
        });
    });

    it("refuses moving a door out of the room", () => {
        const plan = planMove({ model: room, id: "d1", tileX: 9, tileY: 9 });
        expect(plan.reason).toBe("DOOR_OUTSIDE_PRIVATE_ZONE");
        expect(
            planMove({ model: room, id: "d1", tileX: 3, tileY: 3 }).reason
        ).toBeNull();
    });
});

describe("door rule with given rooms (area composer)", () => {
    const stampRoom = buildStampRoomZone({ x: 0, y: 2, w: 4, h: 4 });

    it("reads the given rooms instead of the zones of the model", () => {
        const plan = planPlacement(noRoom, "door", [5, 3], undefined, [
            stampRoom,
        ]);
        expect(plan.result).toEqual({ ok: true });
    });

    it("refuses a door far from the border of the given room", () => {
        const plan = planPlacement(noRoom, "door", [9, 9], undefined, [
            stampRoom,
        ]);
        expect(plan.result).toEqual({
            ok: false,
            reason: "DOOR_OUTSIDE_PRIVATE_ZONE",
        });
    });

    it("refuses every door when the area is not a room", () => {
        const plan = planPlacement(room, "door", [5, 3], undefined, []);
        expect(plan.result).toEqual({
            ok: false,
            reason: "DOOR_AREA_NOT_ROOM",
        });
        expect(describePlacementReason("DOOR_AREA_NOT_ROOM")).toBe(
            PLACEMENT_MESSAGES.DOOR_AREA_NOT_ROOM
        );
    });

    it("moves a door against the given rooms", () => {
        expect(
            planMove({
                model: noRoom,
                id: "d1",
                tileX: 3,
                tileY: 3,
                rooms: [stampRoom],
            }).reason
        ).toBeNull();
        expect(
            planMove({
                model: noRoom,
                id: "d1",
                tileX: 3,
                tileY: 3,
                rooms: [],
            }).reason
        ).toBe("DOOR_AREA_NOT_ROOM");
    });
});

describe("getDoorPaletteReason", () => {
    it("lets the area decide in the composer", () => {
        expect(getDoorPaletteReason(door, true)).toBeNull();
        expect(getDoorPaletteReason(door, false)).toBe(
            DOOR_MESSAGES.AREA_NOT_ROOM
        );
    });

    it("never blocks a door on a map, with or without a room", () => {
        expect(getDoorPaletteReason(door)).toBeNull();
        expect(
            getDoorPaletteReason({
                ...door,
                type: "DECORATION",
            } as AssetDefinition)
        ).toBeNull();
    });
});

describe("removeZone with doors", () => {
    const hostFor = (model: EditorModel) =>
        ({
            getModel: () => model,
            dispatch: () => ({ ok: true }),
        }) as unknown as Parameters<typeof removeZone>[0]["host"];

    it("refuses to remove a room that still has doors", () => {
        const result = removeZone({ host: hostFor(room), zoneId: 1 });
        expect(result).toEqual({
            removed: false,
            reason: ZONE_MESSAGES.ROOM_HAS_DOORS,
        });
    });

    it("removes a zone that is not a room", () => {
        const result = removeZone({ host: hostFor(noRoom), zoneId: 1 });
        expect(result).toEqual({ removed: true });
    });
});
