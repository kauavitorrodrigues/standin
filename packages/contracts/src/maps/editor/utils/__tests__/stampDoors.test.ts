import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import { StampSchema } from "../../schemas/stamp.schema";
import type { Stamp } from "../../types/stamp";
import { buildStampOps } from "../buildStampOps";
import { captureStamp } from "../captureStamp";
import { stampToModel } from "../stampToModel";
import { validateDoors } from "../validateDoors";
import { validateStamp } from "../validateStamp";
import { buildMapModel, buildStamp, palette, tempIds } from "./stampTestKit";

const door = {
    id: "door",
    type: "DOOR",
    placement: "GROUND",
    footprint: { w: 1, h: 2, offsetX: 0 },
} as AssetDefinition;

const library = {
    ...palette,
    assets: [...palette.assets, door],
} as unknown as LibraryPalette;

// The standard stamp (4 x 4) with only a door on its bottom border.
const buildRoomStamp = (
    kind?: "area" | "private",
    doorAt = { dx: 1, dy: 3 }
): Stamp => ({
    ...buildStamp(),
    objects: [
        {
            ...doorAt,
            assetId: "door",
            offsetX: 0,
            offsetY: 0,
            parentIndex: null,
        },
    ],
    zone: kind ? { label: "Reuniao", kind } : { label: "Reuniao" },
});

const codes = (stamp: unknown) =>
    validateStamp(stamp, library).map(({ code }) => code);

const roomKeys = (model: ReturnType<typeof buildMapModel>) =>
    (findZonesGroup(model.layout)?.objects ?? [])
        .filter(isZoneObject)
        .map((object) => objectToZone(object))
        .filter(({ kind }) => kind === "private")
        .map(({ key }) => key);

describe("stamp zone kind", () => {
    it("keeps a stamp without a kind valid and accepts both kinds", () => {
        expect(StampSchema.safeParse(buildStamp()).success).toBe(true);
        expect(StampSchema.safeParse(buildRoomStamp("area")).success).toBe(
            true
        );
        expect(StampSchema.safeParse(buildRoomStamp("private")).success).toBe(
            true
        );
    });

    it("rejects an unknown kind", () => {
        const stamp = {
            ...buildStamp(),
            zone: { label: "Sala", kind: "spawn" },
        };

        expect(StampSchema.safeParse(stamp).success).toBe(false);
    });
});

describe("validateStamp with doors", () => {
    it("accepts a private stamp whose door stands on its border", () => {
        expect(validateStamp(buildRoomStamp("private"), library)).toEqual([]);
    });

    it("refuses a door in a stamp of kind area or with no zone", () => {
        expect(codes(buildRoomStamp("area"))).toEqual([
            Code.STAMP_DOOR_NEEDS_ROOM,
        ]);
        expect(codes(buildRoomStamp())).toEqual([Code.STAMP_DOOR_NEEDS_ROOM]);
        expect(codes({ ...buildRoomStamp("private"), zone: null })).toEqual([
            Code.STAMP_DOOR_NEEDS_ROOM,
        ]);
    });

    it("refuses a door too far from the border of the stamp", () => {
        const stamp: Stamp = {
            ...buildStamp(),
            width: 12,
            height: 10,
            layers: { ground: new Array<number>(120).fill(1) },
            objects: [
                {
                    assetId: "door",
                    dx: 5,
                    dy: 6,
                    offsetX: 0,
                    offsetY: 0,
                    parentIndex: null,
                },
            ],
            zone: { label: "Sala", kind: "private" },
        };

        expect(codes(stamp)).toEqual([Code.STAMP_DOOR_OUTSIDE_ROOM]);
    });

    it("keeps a private stamp with no door valid", () => {
        const stamp = {
            ...buildStamp(),
            zone: { label: "Sala", kind: "private" },
        };

        expect(codes(stamp)).toEqual([]);
    });
});

describe("buildStampOps with a private stamp", () => {
    const place = (model: ReturnType<typeof buildMapModel>, x: number) => {
        const result = buildStampOps(
            model,
            { ...buildRoomStamp("private"), objects: [] },
            x,
            1,
            tempIds()
        );
        if (!result.ok) throw new Error(JSON.stringify(result.errors));
        return result;
    };

    it("creates a private zone over the whole rectangle with a key", () => {
        const { ops } = place(buildMapModel(), 2);
        const zoneOp = ops.find((op) => op.type === "set_zone");

        expect(zoneOp).toEqual({
            type: "set_zone",
            zone: {
                kind: "private",
                rect: { x: 2, y: 1, w: 4, h: 4 },
                label: "Reuniao",
                key: expect.stringMatching(/^room-/),
            },
        });
    });

    it("gives every placement a different key", () => {
        const first = place(buildMapModel(), 0);
        const second = place(first.model, 6);

        const keys = roomKeys(second.model);
        expect(keys).toHaveLength(2);
        expect(new Set(keys).size).toBe(2);
    });

    it("never repeats the key of a zone the map already has", () => {
        const first = place(buildMapModel(), 0);
        const [taken] = roomKeys(first.model);

        const second = buildStampOps(
            first.model,
            { ...buildRoomStamp("private"), objects: [] },
            6,
            1,
            tempIds(),
            undefined,
            () => "custom-key"
        );

        expect(second.ok).toBe(true);
        expect(
            roomKeys((second as { model: typeof first.model }).model)
        ).toEqual([taken, "custom-key"]);
    });

    it("keeps an area stamp as an area zone with no key", () => {
        const result = buildStampOps(
            { ...buildMapModel(), library },
            buildRoomStamp("area"),
            2,
            1,
            tempIds()
        );
        if (!result.ok) throw new Error("not placed");

        expect(result.ops.find((op) => op.type === "set_zone")).toEqual({
            type: "set_zone",
            zone: {
                kind: "area",
                rect: { x: 2, y: 1, w: 4, h: 4 },
                label: "Reuniao",
            },
        });
    });

    it("passes the publish door rule when placed with a door", () => {
        const model = { ...buildMapModel(), library };
        const result = buildStampOps(
            model,
            buildRoomStamp("private"),
            3,
            2,
            tempIds()
        );
        if (!result.ok) throw new Error(JSON.stringify(result.errors));

        expect(result.model.placed).toHaveLength(1);
        expect(validateDoors(result.model)).toEqual([]);
    });

    it("fails the publish door rule when the same stamp is a plain area", () => {
        const model = { ...buildMapModel(), library };
        const result = buildStampOps(
            model,
            buildRoomStamp("area"),
            3,
            2,
            tempIds()
        );
        if (!result.ok) throw new Error(JSON.stringify(result.errors));

        expect(validateDoors(result.model).map(({ code }) => code)).toEqual([
            Code.DOOR_OUTSIDE_PRIVATE_ZONE,
        ]);
        expect(codes(buildRoomStamp("area"))).toEqual([
            Code.STAMP_DOOR_NEEDS_ROOM,
        ]);
    });
});

describe("captureStamp and stampToModel with a room", () => {
    it("captures a room and opens it again with its kind", () => {
        const blank = stampToModel(buildRoomStamp("private"), library);
        if (!blank.ok) throw new Error(JSON.stringify(blank.errors));
        expect(blank.zoneKind).toBe("private");

        const captured = captureStamp(
            blank.model,
            { x: 0, y: 0, w: 4, h: 4 },
            { zoneLabel: " Reuniao ", zoneKind: "private" }
        );

        expect(captured.ok).toBe(true);
        if (captured.ok) {
            expect(captured.stamp.zone).toEqual({
                label: "Reuniao",
                kind: "private",
            });
        }
    });

    it("refuses to capture a door in an area, and writes no kind for it", () => {
        const opened = stampToModel(buildRoomStamp("private"), library);
        if (!opened.ok) throw new Error("not opened");
        const rect = { x: 0, y: 0, w: 4, h: 4 };

        const asArea = captureStamp(opened.model, rect, { zoneLabel: "Sala" });

        expect(asArea.ok).toBe(false);
        if (!asArea.ok) {
            expect(asArea.errors.map(({ code }) => code)).toEqual([
                Code.STAMP_DOOR_NEEDS_ROOM,
            ]);
        }
    });
});
