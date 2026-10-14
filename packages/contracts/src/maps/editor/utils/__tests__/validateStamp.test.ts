import { describe, expect, it } from "vitest";
import { WALL_IMAGE_ID } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
} from "../../consts/limits";
import type { Stamp } from "../../types/stamp";
import { validateStamp } from "../validateStamp";
import { buildStamp, palette } from "./stampTestKit";

const codes = (stamp: unknown, library = palette) =>
    validateStamp(stamp, library).map(({ code }) => code);

const tweak = (change: (stamp: Stamp) => void): Stamp => {
    const stamp = buildStamp();
    change(stamp);
    return stamp;
};

describe("validateStamp", () => {
    it("accepts a valid stamp", () => {
        expect(validateStamp(buildStamp(), palette)).toEqual([]);
    });

    it("answers STAMP_INVALID for something that is not a stamp", () => {
        expect(codes(null)).toEqual([Code.STAMP_INVALID]);
        expect(codes({ version: 2 })).toContain(Code.STAMP_INVALID);
    });

    it("answers STAMP_INVALID for a layer with the wrong size", () => {
        const stamp = tweak((value) => {
            value.layers.ground = [1, 1, 1];
        });

        expect(codes(stamp)).toEqual([Code.STAMP_INVALID]);
    });

    it("answers STAMP_INVALID for a layer value outside the palette", () => {
        const stamp = tweak((value) => {
            value.layers.ground = new Array<number>(16).fill(9);
        });

        expect(codes(stamp)).toEqual([Code.STAMP_INVALID]);
    });

    it("answers STAMP_INVALID for a parent that comes after its child", () => {
        const stamp = tweak((value) => {
            value.objects[1].parentIndex = 3;
        });

        expect(codes(stamp)).toEqual([Code.STAMP_INVALID]);
    });

    it("answers STAMP_INVALID for an offset beyond one tile and a bad zone label", () => {
        expect(
            codes(
                tweak((value) => {
                    value.objects[0].offsetX = 32;
                })
            )
        ).toEqual([Code.STAMP_INVALID]);
        expect(
            codes(
                tweak((value) => {
                    value.zone = { label: "x".repeat(61) };
                })
            )
        ).toEqual([Code.STAMP_INVALID]);
    });

    it("answers STAMP_TOO_SMALL and STAMP_TOO_LARGE for the size", () => {
        expect(
            codes(
                tweak((value) => {
                    value.width = 1;
                })
            )
        ).toContain(Code.STAMP_TOO_SMALL);
        expect(
            codes(
                tweak((value) => {
                    value.width = STAMP_MAX_WIDTH + 1;
                })
            )
        ).toContain(Code.STAMP_TOO_LARGE);
        expect(
            codes(
                tweak((value) => {
                    value.height = STAMP_MAX_HEIGHT + 1;
                })
            )
        ).toContain(Code.STAMP_TOO_LARGE);
    });

    it("answers STAMP_TOO_MANY_OBJECTS above the limit", () => {
        const stamp = tweak((value) => {
            value.objects = Array.from(
                { length: STAMP_MAX_OBJECTS + 1 },
                () => value.objects[2]
            );
        });

        expect(codes(stamp)).toEqual([Code.STAMP_TOO_MANY_OBJECTS]);
    });

    it("answers STAMP_EMPTY for a stamp with no tiles and no objects", () => {
        const stamp = tweak((value) => {
            value.palette = [];
            value.layers = { ground: new Array<number>(16).fill(0) };
            value.objects = [];
        });

        expect(codes(stamp)).toEqual([Code.STAMP_EMPTY]);
    });

    it("answers STAMP_TILESET_UNAVAILABLE when the library lacks a tileset", () => {
        const library = {
            ...palette,
            tilesets: palette.tilesets.filter(({ id }) => id !== WALL_IMAGE_ID),
        };

        expect(codes(buildStamp(), library)).toEqual([
            Code.STAMP_TILESET_UNAVAILABLE,
        ]);
    });

    it("answers STAMP_ASSET_UNAVAILABLE when the library lacks an asset", () => {
        const library = {
            ...palette,
            assets: palette.assets.filter(({ id }) => id !== "chair"),
        };

        expect(codes(buildStamp(), library)).toEqual([
            Code.STAMP_ASSET_UNAVAILABLE,
        ]);
    });

    it("refuses a tile that has no tile meta", () => {
        const stamp = tweak((value) => {
            value.palette[3] = { tilesetId: WALL_IMAGE_ID, tileIndex: 1 };
        });

        expect(codes(stamp)).toEqual([Code.TILE_NOT_IN_LIBRARY]);
    });

    it("refuses a tile on a layer that does not match its category", () => {
        const stamp = tweak((value) => {
            value.layers.walls = [1, 1, 1, 1, ...new Array<number>(12).fill(0)];
        });

        expect(codes(stamp)).toEqual([Code.CATEGORY_LAYER_MISMATCH]);
    });

    it("refuses an object over a solid wall", () => {
        const stamp = tweak((value) => {
            value.objects[2].dx = 0;
            value.objects[2].dy = 0;
        });

        expect(codes(stamp)).toEqual([Code.CELL_BLOCKED_BY_WALL]);
    });

    it("refuses an object that leaves the rectangle", () => {
        const stamp = tweak((value) => {
            value.objects[0].dx = 3;
        });

        expect(codes(stamp)).toEqual([Code.CELL_OUT_OF_BOUNDS]);
    });

    it("refuses a surface item whose parent is not a surface", () => {
        const stamp = tweak((value) => {
            value.objects[1].parentIndex = null;
        });

        expect(codes(stamp)).toEqual([Code.NOT_ON_SURFACE]);
    });
});
