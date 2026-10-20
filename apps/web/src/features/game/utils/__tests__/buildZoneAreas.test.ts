import { describe, expect, it } from "vitest";
import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import { buildZoneAreas } from "@/features/game/utils/buildZoneAreas";

const zone = (overrides: Partial<Zone>): Zone => ({
    kind: LAYOUT_ZONE_KINDS.AREA,
    x: 64,
    y: 96,
    width: 128,
    height: 64,
    ...overrides,
});

describe("buildZoneAreas", () => {
    it("makes a target of a named area, with its label and box", () => {
        expect(
            buildZoneAreas([zone({ key: "lounge", label: "Lounge" })])
        ).toEqual([
            {
                id: "zone:lounge",
                label: "Lounge",
                bounds: { x: 64, y: 96, width: 128, height: 64 },
            },
        ]);
    });

    it("takes a named room too", () => {
        const areas = buildZoneAreas([
            zone({ kind: LAYOUT_ZONE_KINDS.PRIVATE, key: "r1", label: "Sala" }),
        ]);

        expect(areas).toHaveLength(1);
    });

    it("leaves out a zone with no name", () => {
        expect(buildZoneAreas([zone({}), zone({ label: "   " })])).toEqual([]);
    });

    it("leaves out the kinds that are not a place", () => {
        const kinds = [
            LAYOUT_ZONE_KINDS.SPAWN,
            LAYOUT_ZONE_KINDS.PORTAL,
            LAYOUT_ZONE_KINDS.SPOTLIGHT,
        ];

        expect(
            buildZoneAreas(kinds.map((kind) => zone({ kind, label: "X" })))
        ).toEqual([]);
    });

    it("names a zone with no key by its place in the list", () => {
        expect(buildZoneAreas([zone({ label: "A" })])[0]?.id).toBe("zone:0");
    });
});
