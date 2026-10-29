import { describe, expect, it } from "vitest";
import { MAX_CELLS_PER_OP, replayOps } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { createRoom } from "../builders/createRoom";
import { paintFloor } from "../builders/paintFloor";
import { placeDesk } from "../builders/placeDesk";
import { placeDoor } from "../builders/placeDoor";
import { placeObject } from "../builders/placeObject";
import { setSpawn } from "../builders/setSpawn";
import { stampArea } from "../builders/stampArea";
import { ROOM, buildModel } from "./kit";

const apply = (model: EditorModel, ops: EditorOp[]): EditorModel => {
    const replayed = replayOps(model, ops);
    expect(replayed.ok).toBe(true);
    return (replayed as { ok: true; model: EditorModel }).model;
};

const built = (result: { ok: boolean }) => {
    expect(result).toMatchObject({ ok: true });
    return (result as { ok: true; ops: EditorOp[] }).ops;
};

const withRoom = () => {
    const model = buildModel();
    return apply(model, built(createRoom(model, ROOM)));
};

describe("createRoom", () => {
    it("paints the floor, the walls and then the private zone", () => {
        const ops = built(createRoom(buildModel(), ROOM));

        expect(ops.map((op) => op.type)).toEqual([
            "paint",
            "paint",
            "set_zone",
        ]);
        expect(ops[0]).toMatchObject({
            layer: "ground",
            tilesetId: "ts-floor",
        });
        expect(ops[1]).toMatchObject({ layer: "walls", tilesetId: "ts-brick" });
        expect(ops[2]).toEqual({
            type: "set_zone",
            zone: {
                kind: "private",
                key: "office",
                label: "Office",
                rect: { x: 4, y: 4, w: 10, h: 8 },
            },
        });
    });

    it("is deterministic", () => {
        expect(createRoom(buildModel(), ROOM)).toEqual(
            createRoom(buildModel(), ROOM)
        );
    });

    it("draws the outline of the room on the walls layer", () => {
        const model = withRoom();
        const walls = model.layout.layers.find(({ name }) => name === "walls");
        const data = (walls as { data: number[] }).data;
        const width = model.width;

        expect(data[4 * width + 4]).toBeGreaterThan(0);
        expect(data[11 * width + 13]).toBeGreaterThan(0);
        // Inside the room there is floor but no wall.
        expect(data[6 * width + 6]).toBe(0);
    });

    it("makes a zone with no walls when none are asked", () => {
        const ops = built(
            createRoom(buildModel(), {
                ...ROOM,
                walls: undefined,
                floor: undefined,
            })
        );

        expect(ops.map((op) => op.type)).toEqual(["set_zone"]);
    });

    it("refuses a room too small for walls", () => {
        const result = createRoom(buildModel(), { ...ROOM, width: 2 });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues[0].code).toBe("ROOM_TOO_SMALL_FOR_WALLS");
    });

    it("refuses a room past the border of the map", () => {
        const result = createRoom(buildModel(), { ...ROOM, x: 25 });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues[0]).toMatchObject({
            code: "CELL_OUT_OF_BOUNDS",
            path: "room",
        });
    });

    it("refuses a duplicated room key", () => {
        const model = withRoom();

        const result = createRoom(model, { ...ROOM, x: 16, y: 4, width: 6 });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues.map(({ code }) => code)).toContain(
            "ZONE_KEY_DUPLICATED"
        );
    });

    it("refuses an unknown tileset, wall style and incomplete style", () => {
        const model = buildModel();

        const tileset = createRoom(model, {
            ...ROOM,
            walls: { tileset: "nope", style: "Brick" },
        });
        const style = createRoom(model, {
            ...ROOM,
            walls: { tileset: "brick", style: "Marble" },
        });
        const incomplete = createRoom(model, {
            ...ROOM,
            walls: { tileset: "broken", style: "Broken" },
        });

        expect(!tileset.ok && tileset.issues[0].code).toBe(
            "AUTHORING_UNKNOWN_KEY"
        );
        expect(!style.ok && style.issues[0].code).toBe(
            "AUTHORING_WALL_STYLE_NOT_FOUND"
        );
        expect(!incomplete.ok && incomplete.issues[0].code).toBe(
            "WALL_STYLE_INCOMPLETE"
        );
    });

    it("chunks a floor past the cells limit", () => {
        const model = buildModel(100, 100);

        const ops = built(
            createRoom(model, {
                ...ROOM,
                width: 60,
                height: 50,
                walls: undefined,
            })
        );

        const paints = ops.filter((op) => op.type === "paint");
        expect(paints).toHaveLength(2);
        expect(MAX_CELLS_PER_OP).toBe(2500);
    });
});

describe("placeDoor", () => {
    it("opens a gap in the wall and places the variant for the side", () => {
        const model = withRoom();

        const ops = built(
            placeDoor(model, { room: "office", side: "north", door: "door-n" })
        );

        expect(ops[0]).toMatchObject({ type: "erase", layer: "walls" });
        expect(ops[1]).toMatchObject({
            type: "place_asset",
            assetId: "door-n",
            tileY: 4,
        });
        const after = apply(model, ops);
        expect(after.placed).toHaveLength(1);
    });

    it("picks the rotated variant for a side wall, whichever variant is named", () => {
        const model = withRoom();

        const ops = built(
            placeDoor(model, { room: "office", side: "east", door: "door-n" })
        );

        expect(ops[1]).toMatchObject({
            type: "place_asset",
            assetId: "door-e",
            tileX: 13,
        });
    });

    it("honors the offset along the wall", () => {
        const model = withRoom();

        const ops = built(
            placeDoor(model, {
                room: "office",
                side: "south",
                door: "door-s",
                offset: 1,
            })
        );

        expect(ops[1]).toMatchObject({ tileX: 5, tileY: 11 });
    });

    it("refuses a room the map does not have", () => {
        const result = placeDoor(withRoom(), {
            room: "ghost",
            side: "north",
            door: "door-n",
        });

        expect(!result.ok && result.issues[0].code).toBe(
            "AUTHORING_ROOM_NOT_FOUND"
        );
    });

    it("refuses an asset that is not a door", () => {
        const result = placeDoor(withRoom(), {
            room: "office",
            side: "north",
            door: "crate",
        });

        expect(!result.ok && result.issues[0].code).toBe(
            "AUTHORING_WRONG_ASSET_TYPE"
        );
    });

    it("refuses a wall that is not there", () => {
        const model = buildModel();
        const bare = apply(
            model,
            built(createRoom(model, { ...ROOM, walls: undefined }))
        );

        const result = placeDoor(bare, {
            room: "office",
            side: "north",
            door: "door-n",
        });

        expect(!result.ok && result.issues[0].code).toBe(
            "AUTHORING_DOOR_NO_SLOT"
        );
    });

    it("places a door in the first row of the map", () => {
        const model = buildModel();
        const top = apply(
            model,
            built(createRoom(model, { ...ROOM, y: 0, height: 5 }))
        );

        const result = placeDoor(top, {
            room: "office",
            side: "north",
            door: "door-n",
        });

        expect(result.ok).toBe(true);
    });
});

describe("placeObject", () => {
    it("places an object of the library by key", () => {
        const ops = built(
            placeObject(buildModel(), { asset: "crate", tileX: 3, tileY: 3 })
        );

        expect(ops).toEqual([
            {
                type: "place_asset",
                tempId: "authoring-1",
                assetId: "crate",
                tileX: 3,
                tileY: 3,
            },
        ]);
    });

    it("uses the ids the caller gives", () => {
        const ops = built(
            placeObject(
                buildModel(),
                { asset: "crate", tileX: 3, tileY: 3 },
                { newTempId: () => "mine" }
            )
        );

        expect(ops[0]).toMatchObject({ tempId: "mine" });
    });

    it("skips ids the model already uses", () => {
        const model = buildModel();
        const once = apply(
            model,
            built(placeObject(model, { asset: "crate", tileX: 1, tileY: 1 }))
        );

        const ops = built(
            placeObject(once, { asset: "crate", tileX: 2, tileY: 2 })
        );

        expect(ops[0]).toMatchObject({ tempId: "authoring-2" });
    });

    it("refuses an unknown key", () => {
        const result = placeObject(buildModel(), {
            asset: "nope",
            tileX: 1,
            tileY: 1,
        });

        expect(!result.ok && result.issues[0].code).toBe(
            "AUTHORING_UNKNOWN_KEY"
        );
    });

    it("refuses a cell outside the map", () => {
        const result = placeObject(buildModel(), {
            asset: "crate",
            tileX: 30,
            tileY: 3,
        });

        expect(!result.ok && result.issues[0]).toMatchObject({
            code: "CELL_OUT_OF_BOUNDS",
            opIndex: 0,
        });
    });

    it("refuses overlapping footprints", () => {
        const model = buildModel();
        const once = apply(
            model,
            built(placeObject(model, { asset: "crate", tileX: 5, tileY: 5 }))
        );

        const result = placeObject(once, {
            asset: "crate",
            tileX: 5,
            tileY: 5,
        });

        expect(!result.ok && result.issues[0].code).toBe("FOOTPRINT_OVERLAP");
    });

    it("refuses an object past the object limit of the map", () => {
        const model = {
            ...buildModel(),
            limits: { objectsUsed: 1, objectsMax: 1 },
        };

        const result = placeObject(model, {
            asset: "crate",
            tileX: 5,
            tileY: 5,
        });

        expect(!result.ok && result.issues[0].code).toBe("TOO_MANY_OBJECTS");
    });
});

describe("placeDesk", () => {
    it("places the desk, then what stands on it and the chair", () => {
        const ops = built(
            placeDesk(buildModel(), {
                desk: "desk",
                tileX: 5,
                tileY: 5,
                items: [{ asset: "monitor", tileX: 5, tileY: 5 }],
                chairs: [{ asset: "chair", tileX: 5, tileY: 6 }],
            })
        );

        expect(ops).toEqual([
            expect.objectContaining({ assetId: "desk", tempId: "authoring-1" }),
            expect.objectContaining({
                assetId: "monitor",
                parentId: "authoring-1",
            }),
            expect.objectContaining({ assetId: "chair", tileY: 6 }),
        ]);
        expect(ops[2]).not.toHaveProperty("parentId");
    });

    it("refuses an asset of another type as the desk or the chair", () => {
        const result = placeDesk(buildModel(), {
            desk: "crate",
            tileX: 5,
            tileY: 5,
            chairs: [{ asset: "crate", tileX: 5, tileY: 6 }],
        });

        expect(!result.ok && result.issues.map(({ code }) => code)).toEqual([
            "AUTHORING_WRONG_ASSET_TYPE",
            "AUTHORING_WRONG_ASSET_TYPE",
        ]);
    });

    it("refuses an item that does not sit on the desk", () => {
        const result = placeDesk(buildModel(), {
            desk: "desk",
            tileX: 5,
            tileY: 5,
            items: [{ asset: "monitor", tileX: 9, tileY: 9 }],
        });

        expect(!result.ok && result.issues[0].code).toBe("NOT_ON_SURFACE");
    });

    it("refuses a chair on the desk", () => {
        const result = placeDesk(buildModel(), {
            desk: "desk",
            tileX: 5,
            tileY: 5,
            chairs: [{ asset: "chair", tileX: 5, tileY: 5 }],
        });

        expect(!result.ok && result.issues[0].code).toBe("FOOTPRINT_OVERLAP");
    });
});

describe("setSpawn", () => {
    it("adds a spawn zone of one tile", () => {
        const ops = built(setSpawn(buildModel(), { tileX: 2, tileY: 3 }));

        expect(ops).toEqual([
            {
                type: "set_zone",
                zone: {
                    kind: "spawn",
                    rect: { x: 2, y: 3, w: 1, h: 1 },
                    label: "Spawn",
                },
            },
        ]);
    });

    it("refuses a spawn outside the map", () => {
        const result = setSpawn(buildModel(), { tileX: 99, tileY: 3 });

        expect(result.ok).toBe(false);
    });
});

describe("paintFloor", () => {
    it("paints the rectangle between two corners, both included", () => {
        const ops = built(
            paintFloor(buildModel(), {
                from: [3, 2],
                to: [1, 1],
                tileset: "floor",
                tileIndex: 1,
            })
        );

        expect(ops).toHaveLength(1);
        const [op] = ops as Extract<EditorOp, { type: "paint" }>[];
        expect(op).toMatchObject({
            layer: "ground",
            tilesetId: "ts-floor",
            tileIndex: 1,
        });
        expect(op.cells).toHaveLength(6);
    });

    it("splits a large rectangle into blocks of the cells limit", () => {
        const ops = built(
            paintFloor(buildModel(100, 100), {
                from: [0, 0],
                to: [99, 49],
                tileset: "floor",
                tileIndex: 0,
            })
        ) as Extract<EditorOp, { type: "paint" }>[];

        expect(ops.map((op) => op.cells.length)).toEqual([2500, 2500]);
    });

    it("refuses a tile that is not a floor on the ground", () => {
        const result = paintFloor(buildModel(), {
            from: [0, 0],
            to: [1, 1],
            tileset: "brick",
            tileIndex: 0,
        });

        expect(result.ok).toBe(false);
    });

    it("refuses cells outside the map", () => {
        const result = paintFloor(buildModel(), {
            from: [0, 0],
            to: [40, 1],
            tileset: "floor",
            tileIndex: 0,
        });

        expect(!result.ok && result.issues[0].code).toBe("CELL_OUT_OF_BOUNDS");
    });
});

describe("stampArea", () => {
    const stamp = {
        version: 1,
        width: 2,
        height: 2,
        palette: [{ tilesetId: "ts-floor", tileIndex: 0 }],
        layers: { ground: [1, 1, 1, 1] },
        objects: [],
    } as never;

    it("places a stamp with the shared stamp ops", () => {
        const ops = built(
            stampArea(buildModel(), { stamp, tileX: 2, tileY: 2 })
        );

        expect(ops.some((op) => op.type === "paint_tiles")).toBe(true);
    });

    it("refuses a stamp outside the map", () => {
        const result = stampArea(buildModel(), { stamp, tileX: 29, tileY: 2 });

        expect(!result.ok && result.issues[0].code).toBe("STAMP_OUT_OF_BOUNDS");
    });
});
