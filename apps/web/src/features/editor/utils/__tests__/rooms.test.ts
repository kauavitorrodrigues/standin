import { describe, expect, it } from "vitest";
import { TILE_SIZE, type Zone } from "@standin/contracts";
import { buildNamedZone } from "@/features/editor/utils/buildNamedZone";
import { buildZoneSetOp } from "@/features/editor/utils/buildZoneSetOp";
import { createRoomKey } from "@/features/editor/utils/createRoomKey";
import { getLayoutZoneKeys } from "@/features/editor/utils/getLayoutZoneKeys";
import { getTooSmallHint } from "@/features/editor/utils/getTooSmallHint";
import { getZoneShape } from "@/features/editor/utils/getZoneShape";
import { isEditableZone } from "@/features/editor/utils/isEditableZone";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { buildZoneModel } from "@/features/editor/lib/__tests__/fixtures/buildZoneModel";

const zone = (overrides: Partial<Zone>): Zone => ({
    id: 3,
    kind: "private",
    x: TILE_SIZE,
    y: TILE_SIZE,
    width: TILE_SIZE * 3,
    height: TILE_SIZE * 3,
    label: "Sala",
    key: "room-a",
    ...overrides,
});

describe("isEditableZone, room", () => {
    it("accepts a private zone on the grid", () => {
        expect(isEditableZone(zone({}))).toBe(true);
    });

    it("keeps refusing a room that is rotated, off the grid or without an id", () => {
        expect(isEditableZone(zone({ rotation: 90 }))).toBe(false);
        expect(isEditableZone(zone({ x: 5 }))).toBe(false);
        expect(isEditableZone(zone({ id: undefined }))).toBe(false);
    });

    it("still refuses kinds the editor cannot write back", () => {
        expect(isEditableZone(zone({ kind: "portal" }))).toBe(false);
    });
});

describe("createRoomKey", () => {
    it("builds a short key with the room prefix", () => {
        expect(createRoomKey({ taken: [] })).toMatch(/^room-[0-9a-f]{8}$/);
    });

    it("skips a key the map already has", () => {
        const suffixes = ["same", "same", "other"];
        const key = createRoomKey({
            taken: ["room-same"],
            suffix: () => suffixes.shift() ?? "none",
        });

        expect(key).toBe("room-other");
    });

    it("never repeats a taken key even when the source gets stuck", () => {
        const key = createRoomKey({
            taken: ["room-same"],
            suffix: () => "same",
        });

        expect(key).not.toBe("room-same");
    });
});

describe("buildNamedZone", () => {
    const rect = { x: 1, y: 2, w: 3, h: 3 };

    it("gives a room a generated key that is not taken", () => {
        const built = buildNamedZone({
            kind: "private",
            rect,
            label: "Sala",
            takenKeys: ["room-a"],
        });

        expect(built).toMatchObject({ kind: "private", rect, label: "Sala" });
        expect(built.key).toMatch(/^room-/);
        expect(built.key).not.toBe("room-a");
    });

    it("gives an area no key", () => {
        expect(
            buildNamedZone({ kind: "area", rect, label: "Copa", takenKeys: [] })
        ).toEqual({ kind: "area", rect, label: "Copa" });
    });
});

describe("buildZoneSetOp, room", () => {
    it("keeps the key and the name of the room when it moves", () => {
        const op = buildZoneSetOp({
            zone: zone({}),
            rect: { x: 5, y: 5, w: 3, h: 3 },
        });

        expect(op).toEqual({
            type: "set_zone",
            zone: {
                id: 3,
                kind: "private",
                rect: { x: 5, y: 5, w: 3, h: 3 },
                label: "Sala",
                key: "room-a",
            },
        });
    });

    it("renames a room without touching its key", () => {
        const op = buildZoneSetOp({
            zone: zone({}),
            rect: { x: 1, y: 1, w: 3, h: 3 },
            label: "Copa",
        });

        expect(op).toMatchObject({
            zone: { label: "Copa", key: "room-a" },
        });
    });
});

describe("room shape and keys", () => {
    it("draws a room as its own shape, outline and label like an area", () => {
        expect(getZoneShape(zone({}))).toMatchObject({
            kind: "room",
            label: "Sala",
            labelX: TILE_SIZE,
        });
    });

    it("reads the keys of the zones in a layout", () => {
        const model = buildZoneModel([
            { id: 1, kind: "spawn", x: 0, y: 0, w: 1, h: 1 },
            {
                id: 2,
                kind: "private",
                x: 2,
                y: 2,
                w: 3,
                h: 3,
                label: "A",
                key: "k1",
            },
        ]);

        expect(getLayoutZoneKeys(model.layout)).toEqual(["k1"]);
    });

    it("words the too small hint by kind", () => {
        expect(getTooSmallHint("private")).toBe(
            ZONE_MESSAGES.ROOM_AREA_TOO_SMALL
        );
        expect(getTooSmallHint("area")).toBe(ZONE_MESSAGES.AREA_TOO_SMALL);
    });
});
