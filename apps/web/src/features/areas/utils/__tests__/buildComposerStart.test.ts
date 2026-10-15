import { describe, expect, it } from "vitest";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    type AreaDetail,
    type AssetDefinition,
    type LibraryPalette,
    type Stamp,
} from "@standin/contracts";
import { AREA_FRAME_INITIAL } from "../../consts/composer";
import { buildComposerStart } from "../buildComposerStart";

const table = {
    id: "table",
    type: "TABLE",
    placement: "GROUND",
    footprint: { w: 2, h: 1, offsetX: 0 },
} as AssetDefinition;
const palette = {
    tilesets: [],
    assets: [table],
    categories: [],
    areas: [],
} as LibraryPalette;

const stamp: Stamp = {
    version: 1,
    width: 6,
    height: 4,
    palette: [],
    layers: {},
    objects: [
        {
            assetId: "table",
            dx: 1,
            dy: 2,
            offsetX: 3,
            offsetY: -2,
            parentIndex: null,
        },
    ],
    zone: { label: "Reunião" },
};

const area = (overrides: Partial<AreaDetail> = {}): AreaDetail =>
    ({ id: "a1", name: "Sala", stamp, ...overrides }) as AreaDetail;

describe("buildComposerStart", () => {
    it("opens a new area on a blank canvas of the maximum size", () => {
        const result = buildComposerStart({ palette });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.start.model.width).toBe(STAMP_MAX_WIDTH);
        expect(result.start.model.height).toBe(STAMP_MAX_HEIGHT);
        expect(result.start.model.placed).toEqual([]);
        expect(result.start.frame).toEqual(AREA_FRAME_INITIAL);
        expect(result.start.values).toEqual({
            name: "",
            createZone: true,
        });
    });

    it("lays an existing stamp on the origin of the big canvas and frames it", () => {
        const result = buildComposerStart({ palette, area: area() });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.start.model.width).toBe(STAMP_MAX_WIDTH);
        expect(result.start.model.height).toBe(STAMP_MAX_HEIGHT);
        expect(result.start.model.placed).toEqual([
            expect.objectContaining({
                assetId: "table",
                tileX: 1,
                tileY: 2,
                offsetX: 3,
                offsetY: -2,
            }),
        ]);
        expect(result.start.frame).toEqual({ x: 0, y: 0, w: 6, h: 4 });
        expect(result.start.values).toEqual({
            name: "Sala",
            createZone: true,
        });
    });

    it("unchecks the box when the area has no zone", () => {
        const noZone = buildComposerStart({
            palette,
            area: area({ stamp: { ...stamp, zone: null } }),
        });

        expect(noZone.ok && noZone.start.values).toMatchObject({
            createZone: false,
        });
    });

    it("fails when the library no longer has what the stamp uses", () => {
        const result = buildComposerStart({
            palette: { ...palette, assets: [] },
            area: area(),
        });

        expect(result.ok).toBe(false);
    });
});
