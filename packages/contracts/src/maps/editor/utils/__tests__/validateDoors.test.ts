import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import { TILE_SIZE } from "../../../consts/constants";
import { LAYOUT_ISSUE_CODES } from "../../../layout/issues";
import { buildLayout } from "../../../layout/__tests__/fixtures";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { LAYOUT_ZONE_KINDS } from "../../../schemas/layout.schema";
import type { Zone } from "../../../layout/zone";
import { zoneToObject } from "../../../layout/zone";
import type { EditorModel } from "../../types/editor-model";
import { validateDoors } from "../validateDoors";

const door = {
    id: "door",
    type: "DOOR",
    placement: "GROUND",
    footprint: { w: 1, h: 2, offsetX: 0 },
} as AssetDefinition;
const crate = {
    id: "crate",
    type: "DECORATION",
    placement: "GROUND",
    footprint: { w: 1, h: 1, offsetX: 0 },
} as AssetDefinition;

const room = (key: string, x: number, y: number): Zone => ({
    kind: LAYOUT_ZONE_KINDS.PRIVATE,
    key,
    label: key,
    x,
    y,
    width: 10 * TILE_SIZE,
    height: 10 * TILE_SIZE,
});

const buildModel = (
    zones: Zone[],
    placed: Partial<EditorModel["placed"][number]>[]
): EditorModel => {
    const layout = buildLayout();
    const group = findZonesGroup(layout)!;
    group.objects = zones.map((zone, index) => zoneToObject(zone, index + 1));
    return {
        mapId: "map-1",
        width: layout.width,
        height: layout.height,
        layout,
        placed: placed.map((item, index) => ({
            id: `p${index}`,
            assetId: "door",
            tileX: 0,
            tileY: 0,
            offsetX: 0,
            offsetY: 0,
            parentId: null,
            propertyOverrides: null,
            ...item,
        })),
        library: {
            tilesets: [],
            assets: [door, crate],
            categories: [],
            areas: [],
        } as unknown as LibraryPalette,
        desks: [],
        limits: { objectsUsed: 0, objectsMax: 100 },
        version: 1,
    };
};

describe("validateDoors", () => {
    it("accepts a door on the border of one room", () => {
        // The room spans tiles 5..14. The door stands in the left wall.
        const model = buildModel(
            [room("a", 5 * TILE_SIZE, 5 * TILE_SIZE)],
            [{ tileX: 5, tileY: 8 }]
        );

        expect(validateDoors(model)).toEqual([]);
    });

    it("refuses a door outside every room", () => {
        const model = buildModel(
            [room("a", 5 * TILE_SIZE, 5 * TILE_SIZE)],
            [{ tileX: 20, tileY: 20 }]
        );

        const issues = validateDoors(model);
        expect(issues).toHaveLength(1);
        expect(issues[0]?.code).toBe(
            LAYOUT_ISSUE_CODES.DOOR_OUTSIDE_PRIVATE_ZONE
        );
        expect(issues[0]?.path).toBe("placed.p0");
    });

    it("refuses a door with no room at all", () => {
        const model = buildModel([], [{ tileX: 5, tileY: 8 }]);

        expect(validateDoors(model)[0]?.code).toBe(
            LAYOUT_ISSUE_CODES.DOOR_OUTSIDE_PRIVATE_ZONE
        );
    });

    it("refuses a door between two rooms", () => {
        const model = buildModel(
            [
                room("a", 5 * TILE_SIZE, 5 * TILE_SIZE),
                room("b", 15 * TILE_SIZE, 5 * TILE_SIZE),
            ],
            [{ tileX: 14, tileY: 8 }]
        );

        expect(validateDoors(model)[0]?.code).toBe(
            LAYOUT_ISSUE_CODES.DOOR_BETWEEN_ROOMS
        );
    });

    it("uses the pixel offset of the door", () => {
        // Tile 2 is three tiles from the wall at tile 5, so it is out of reach.
        const model = buildModel(
            [room("a", 5 * TILE_SIZE, 5 * TILE_SIZE)],
            [
                { tileX: 2, tileY: 8 },
                { tileX: 2, tileY: 8, offsetX: 3 * TILE_SIZE - 1 },
            ]
        );

        const issues = validateDoors(model);
        expect(issues.map((issue) => issue.path)).toEqual(["placed.p0"]);
    });

    it("ignores objects that are not doors", () => {
        const model = buildModel(
            [],
            [{ assetId: "crate", tileX: 20, tileY: 20 }]
        );

        expect(validateDoors(model)).toEqual([]);
    });
});
