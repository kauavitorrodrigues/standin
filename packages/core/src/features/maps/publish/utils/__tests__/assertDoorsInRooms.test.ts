import { describe, expect, it } from "vitest";
import { PublishValidationError, applyOp } from "@standin/contracts";
import type { AssetDefinition, EditorModel } from "@standin/contracts";
import { assertDoorsInRooms } from "../assertDoorsInRooms";

const door = {
    id: "door",
    type: "DOOR",
    footprint: { w: 1, h: 2, offsetX: 0 },
} as AssetDefinition;

const buildModel = (tileX: number): EditorModel =>
    ({
        mapId: "map-1",
        width: 40,
        height: 40,
        layout: {
            layers: [
                {
                    type: "objectgroup",
                    name: "zones",
                    objects: [
                        {
                            id: 1,
                            name: "room",
                            type: "",
                            x: 160,
                            y: 160,
                            width: 320,
                            height: 320,
                            rotation: 0,
                            visible: true,
                            properties: [
                                {
                                    name: "kind",
                                    type: "string",
                                    value: "private",
                                },
                                {
                                    name: "label",
                                    type: "string",
                                    value: "Room",
                                },
                                { name: "key", type: "string", value: "room" },
                            ],
                        },
                    ],
                },
            ],
        },
        placed: [
            {
                id: "d1",
                assetId: "door",
                tileX,
                tileY: 8,
                offsetX: 0,
                offsetY: 0,
                parentId: null,
                propertyOverrides: null,
            },
        ],
        desks: [],
        library: { tilesets: [], assets: [door], categories: [], areas: [] },
        limits: { objectsUsed: 1, objectsMax: 100 },
        version: 1,
    }) as unknown as EditorModel;

describe("assertDoorsInRooms", () => {
    it("lets a door on the border of a room pass", () => {
        expect(() => assertDoorsInRooms(buildModel(5), 2)).not.toThrow();
    });

    it("refuses a door outside every room with the last op index", () => {
        try {
            assertDoorsInRooms(buildModel(30), 3);
            expect.unreachable();
        } catch (error) {
            expect(error).toBeInstanceOf(PublishValidationError);
            const { errors } = error as PublishValidationError;
            expect(errors).toHaveLength(1);
            expect(errors[0]).toMatchObject({
                opIndex: 2,
                code: "DOOR_OUTSIDE_PRIVATE_ZONE",
            });
        }
    });

    it("refuses a door left behind when its room zone is removed", () => {
        const model = buildModel(5);
        const group = model.layout.layers[0] as unknown as {
            objects: unknown[];
        };
        group.objects.push({
            id: 2,
            name: "spawn",
            type: "",
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            rotation: 0,
            visible: true,
            properties: [
                { name: "kind", type: "string", value: "spawn" },
                { name: "label", type: "string", value: "Spawn" },
                { name: "key", type: "string", value: "spawn" },
            ],
        });
        expect(() => assertDoorsInRooms(model, 2)).not.toThrow();

        const result = applyOp(
            model.layout,
            { type: "remove_zone", zoneId: 1 },
            model.library as never
        );
        expect(result.errors).toHaveLength(0);

        expect(() =>
            assertDoorsInRooms({ ...model, layout: result.layout }, 3)
        ).toThrow(PublishValidationError);
    });
});
