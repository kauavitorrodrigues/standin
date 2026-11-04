import { describe, expect, it } from "vitest";
import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import { buildCommonAreas } from "../buildCommonAreas";

const zone = (overrides: Partial<Zone>): Zone =>
    ({
        kind: LAYOUT_ZONE_KINDS.AREA,
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        ...overrides,
    }) as Zone;

describe("buildCommonAreas", () => {
    it("keeps the named areas", () => {
        const areas = buildCommonAreas([
            zone({ key: "lounge", label: "Sala" }),
        ]);
        expect(areas).toEqual([
            { key: "lounge", label: "Sala", x: 0, y: 0, width: 64, height: 64 },
        ]);
    });

    it("drops an area without a name", () => {
        expect(buildCommonAreas([zone({ label: "  " })])).toEqual([]);
    });

    it("drops private rooms and other kinds", () => {
        const areas = buildCommonAreas([
            zone({ kind: LAYOUT_ZONE_KINDS.PRIVATE, label: "Sala 1" }),
            zone({ kind: LAYOUT_ZONE_KINDS.SPAWN, label: "Entrada" }),
        ]);
        expect(areas).toEqual([]);
    });
});
