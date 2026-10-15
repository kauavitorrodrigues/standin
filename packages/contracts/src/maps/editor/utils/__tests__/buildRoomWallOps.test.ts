import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "../../../consts/constants";
import {
    THIN_ID,
    buildLibrary,
    PIECE_ORDER,
} from "../../../layout/__tests__/thinWallKit";
import { defaults } from "../../../layout/__tests__/fixtures";
import { applyOps } from "../../../layout/applyOps";
import { generateBlankLayout } from "../../../layout/generateBlankLayout";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { LayoutOp } from "../../../layout/ops.schema";
import {
    ROOM_WALLS_MIN_TILES,
    buildRoomWallOps,
    getRoomOutlineCells,
} from "../buildRoomWallOps";

const library = buildLibrary();
const room = (columns: number, rows: number) => ({
    x: 3 * TILE_SIZE,
    y: 3 * TILE_SIZE,
    width: columns * TILE_SIZE,
    height: rows * TILE_SIZE,
});

describe("getRoomOutlineCells", () => {
    it("lists the border of the room and nothing inside", () => {
        const cells = getRoomOutlineCells(room(5, 4));

        // 5 x 4 tiles: 2 * 5 + 2 * 2 border cells.
        expect(cells).toHaveLength(14);
        expect(cells).not.toContainEqual([5, 4]);
        expect(cells).toContainEqual([3, 3]);
        expect(cells).toContainEqual([7, 6]);
    });
});

describe("buildRoomWallOps", () => {
    it("draws a room of five by four with the eight pieces", () => {
        const built = buildRoomWallOps(room(5, 4), THIN_ID, 4);
        if (!built.ok) throw new Error("refused");

        const blank = generateBlankLayout("XS", { floor: defaults.floor });
        const result = applyOps(blank, built.ops as LayoutOp[], library);
        expect(result.errors).toEqual([]);

        const walls = findTileLayer(result.layout, "walls");
        const firstgid =
            result.layout.tilesets.find(({ name }) => name === THIN_ID)
                ?.firstgid ?? 0;
        const pieces = new Set(
            walls?.data
                .filter((gid) => gid > 0)
                .map((gid) => PIECE_ORDER[gid - firstgid])
        );

        expect(pieces.size).toBe(8);
    });

    it("refuses a room under three tiles on a side", () => {
        const built = buildRoomWallOps(room(2, 5), THIN_ID, 4);

        expect(ROOM_WALLS_MIN_TILES).toBe(3);
        expect(built.ok).toBe(false);
        if (built.ok) return;
        expect(built.errors[0].code).toBe(Code.ROOM_TOO_SMALL_FOR_WALLS);
    });

    it("is one operation for an ordinary room", () => {
        const built = buildRoomWallOps(room(10, 8), THIN_ID, 4);

        expect(built.ok && built.ops).toHaveLength(1);
    });
});
