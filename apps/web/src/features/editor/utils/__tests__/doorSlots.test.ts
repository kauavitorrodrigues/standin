import { describe, expect, it } from "vitest";
import {
    LAYOUT_LAYER_NAMES,
    LAYOUT_ZONES_LAYER_NAME,
    TILE_SIZE,
    TILED_LAYER_TYPES,
    type AssetDefinition,
    type DoorSlot,
    type EditorModel,
    type MapLayout,
} from "@standin/contracts";
import { findNearestDoorSlot } from "@/features/editor/utils/findNearestDoorSlot";
import {
    getDoorSlots,
    planDoorAtSlot,
} from "@/features/editor/utils/doorSlots";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const door = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "door",
        type: "DOOR",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        surfaceHeightPx: 0,
        baseAssetId: null,
        rotation: "DEG_0",
        colorKey: null,
        ...overrides,
    }) as unknown as AssetDefinition;

const base = door({ id: "door", rotation: "DEG_0" });
const east = door({ id: "door-east", baseAssetId: "door", rotation: "DEG_90" });

// A 6x6 map with a room at (1,1) of 4x4. The walls are its border, with a hole
// at the north wall (column 2) and at the east wall (row 3).
const buildDoorModel = (assets: AssetDefinition[], placed = []): EditorModel => {
    const model = buildModel(placed);
    const data = new Array<number>(100).fill(0);
    const wall = (column: number, row: number) => {
        data[row * 10 + column] = 1;
    };
    for (let i = 1; i <= 4; i++) {
        wall(i, 1);
        wall(i, 4);
        wall(1, i);
        wall(4, i);
    }
    data[1 * 10 + 2] = 0;
    data[3 * 10 + 4] = 0;

    const layout = {
        width: 10,
        height: 10,
        tilesets: [],
        layers: [
            {
                type: TILED_LAYER_TYPES.TILE_LAYER,
                name: LAYOUT_LAYER_NAMES.WALLS,
                width: 10,
                height: 10,
                data,
            },
            {
                type: TILED_LAYER_TYPES.OBJECT_GROUP,
                name: LAYOUT_ZONES_LAYER_NAME,
                objects: [
                    {
                        id: 1,
                        name: "r",
                        type: "private",
                        x: TILE_SIZE,
                        y: TILE_SIZE,
                        width: 4 * TILE_SIZE,
                        height: 4 * TILE_SIZE,
                        properties: [
                            { name: "kind", type: "string", value: "private" },
                            { name: "key", type: "string", value: "r" },
                            { name: "label", type: "string", value: "r" },
                        ],
                    },
                ],
            },
        ],
    } as unknown as MapLayout;

    return {
        ...model,
        layout,
        library: { ...model.library, assets } as EditorModel["library"],
    };
};

describe("getDoorSlots", () => {
    it("finds the gaps of the room walls for the door family", () => {
        const slots = getDoorSlots(buildDoorModel([base, east]), "door-east");

        expect(slots.map(({ side, tileX, tileY }) => [side, tileX, tileY])).toEqual(
            [
                ["north", 2, 1],
                ["east", 4, 3],
            ]
        );
    });

    it("returns nothing for an asset that is not a door", () => {
        expect(getDoorSlots(buildDoorModel([base]), "crate")).toEqual([]);
        expect(getDoorSlots(buildDoorModel([base]), "missing")).toEqual([]);
    });

    it("leaves out the gaps covered by a placed object", () => {
        const crate = door({ id: "crate", type: "DECORATION" } as never);
        const model = buildDoorModel([base, crate], [
            placedAt("c1", "crate", 2, 1),
        ] as never);

        expect(getDoorSlots(model, "door").map(({ side }) => side)).toEqual([
            "east",
        ]);
    });
});

describe("planDoorAtSlot", () => {
    it("uses the rotation that fits the side and is ok on the border", () => {
        const model = buildDoorModel([base, east]);
        const [, eastSlot] = getDoorSlots(model, "door");
        const result = planDoorAtSlot(model, eastSlot as DoorSlot, "door");

        expect(result?.exact).toBe(true);
        expect(result?.plan.asset?.id).toBe("door-east");
        expect(result?.plan).toMatchObject({
            tileX: 4,
            tileY: 3,
            offsetX: 0,
            offsetY: 0,
            result: { ok: true },
        });
    });

    it("falls back to the base variant, not exact, when the side has none", () => {
        const model = buildDoorModel([base, east]);
        const [northSlot] = getDoorSlots(model, "door");
        const result = planDoorAtSlot(model, northSlot as DoorSlot, "door-east");

        expect(result?.exact).toBe(true);
        expect(result?.plan.asset?.id).toBe("door");

        const lone = buildDoorModel([base]);
        const [eastOnly] = getDoorSlots(lone, "door").slice(1);
        const fallback = planDoorAtSlot(lone, eastOnly as DoorSlot, "door");
        expect(fallback?.exact).toBe(false);
        expect(fallback?.plan.asset?.id).toBe("door");
    });

    it("returns null for an asset without family", () => {
        const model = buildDoorModel([base]);
        const slot = getDoorSlots(model, "door")[0] as DoorSlot;

        expect(planDoorAtSlot(model, slot, "missing")).toBeNull();
    });
});

describe("findNearestDoorSlot", () => {
    const slot = (tileX: number, tileY: number): DoorSlot => ({
        roomKey: "r",
        side: "north",
        tileX,
        tileY,
        width: 1,
        height: 1,
    });

    it("picks the closest slot within the radius", () => {
        const slots = [slot(0, 0), slot(5, 5)];

        expect(findNearestDoorSlot(slots, { x: 4.6, y: 5.2 }, 4)).toBe(slots[1]);
    });

    it("returns null when every slot is farther than the radius", () => {
        expect(findNearestDoorSlot([slot(10, 10)], { x: 0, y: 0 }, 4)).toBeNull();
        expect(findNearestDoorSlot([], { x: 0, y: 0 }, 4)).toBeNull();
    });
});
