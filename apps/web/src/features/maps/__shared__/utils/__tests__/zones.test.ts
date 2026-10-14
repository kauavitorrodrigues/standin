import { describe, expect, it } from "vitest";
import type { MapLayout, Zone } from "@standin/contracts";
import { getLayoutZones } from "@/features/maps/__shared__/utils/getLayoutZones";
import { getZoneShape } from "@/features/maps/__shared__/utils/getZoneShape";

const zone = (overrides: Partial<Zone>): Zone => ({
    kind: "area",
    x: 64,
    y: 32,
    width: 96,
    height: 64,
    ...overrides,
});

describe("getZoneShape", () => {
    it("puts a spawn marker at the center of its rectangle", () => {
        expect(
            getZoneShape(zone({ kind: "spawn", width: 32, height: 32 }))
        ).toEqual({
            kind: "spawn",
            x: 80,
            y: 48,
        });
    });

    it("outlines an area with the four corners and the label", () => {
        const shape = getZoneShape(zone({ label: "Sala" }));

        expect(shape).toEqual({
            kind: "area",
            outline: [
                { x: 64, y: 32 },
                { x: 160, y: 32 },
                { x: 160, y: 96 },
                { x: 64, y: 96 },
            ],
            labelX: 64,
            labelY: 32,
            label: "Sala",
        });
    });

    it("falls back to the name and follows a polygon", () => {
        const shape = getZoneShape(
            zone({
                name: "Copa",
                polygon: [
                    { x: 0, y: 0 },
                    { x: 32, y: 0 },
                    { x: 0, y: 32 },
                ],
            })
        );

        expect(shape).toMatchObject({
            label: "Copa",
            outline: [
                { x: 64, y: 32 },
                { x: 96, y: 32 },
                { x: 64, y: 64 },
            ],
        });
    });
});

describe("getLayoutZones", () => {
    const object = (id: number, kind?: string) => ({
        id,
        name: `o${id}`,
        type: "",
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        rotation: 0,
        visible: true,
        properties: kind ? [{ name: "kind", type: "string", value: kind }] : [],
    });

    it("reads the objects with a kind from the zones group only", () => {
        const layout = {
            layers: [
                {
                    id: 1,
                    type: "objectgroup",
                    name: "zones",
                    x: 0,
                    y: 0,
                    visible: true,
                    opacity: 1,
                    objects: [object(1, "spawn"), object(2), object(3, "area")],
                },
                {
                    id: 2,
                    type: "objectgroup",
                    name: "other",
                    x: 0,
                    y: 0,
                    visible: true,
                    opacity: 1,
                    objects: [object(4, "area")],
                },
            ],
        } as unknown as MapLayout;

        expect(getLayoutZones(layout).map((item) => item.id)).toEqual([1, 3]);
    });
});
