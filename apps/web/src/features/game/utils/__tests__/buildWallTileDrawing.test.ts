import { describe, expect, it } from "vitest";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import { getAvatarDepth } from "@/features/game/utils/getAvatarDepth";
import { buildWallTileDrawing } from "@/features/game/utils/buildWallTileDrawing";
import { PLAIN_WALL_TILE } from "@/features/game/utils/wallTile";

const MAP_HEIGHT = 640;

// An avatar whose feet are at `feetY`.
const avatarDepth = (feetY: number): number =>
    getAvatarDepth({
        feetY,
        mapHeightPx: MAP_HEIGHT,
        isSitting: false,
    });

const wallDepth = (row: number): number =>
    buildWallTileDrawing(PLAIN_WALL_TILE, row, 1, MAP_HEIGHT).slices[0].depth;

describe("buildWallTileDrawing", () => {
    it("draws a plain wall tile as one whole slice", () => {
        const drawing = buildWallTileDrawing(PLAIN_WALL_TILE, 5, 1, MAP_HEIGHT);
        expect(drawing.slices).toHaveLength(1);
        expect(drawing.slices[0].crop).toBeNull();
        expect(drawing.top).toBeNull();
    });

    it("puts an avatar above a horizontal wall under it and one below over it", () => {
        // A wall on row 5 has its base at y 192.
        const depth = wallDepth(5);
        expect(avatarDepth(5 * 32 - 2)).toBeLessThan(depth);
        expect(avatarDepth(6 * 32 + 10)).toBeGreaterThan(depth);
    });

    it("puts an avatar beside a vertical wall on the order of its feet", () => {
        // The east piece of rows 5 and 6: an avatar on row 5 is behind the tile
        // of row 6 and in front of the tile of row 4.
        const feetY = 5 * 32 + 20;
        expect(avatarDepth(feetY)).toBeLessThan(wallDepth(5) + 0.5);
        expect(avatarDepth(feetY)).toBeLessThan(wallDepth(6));
        expect(avatarDepth(feetY)).toBeGreaterThan(wallDepth(4));
    });

    it("gives the top the depth of its wall, a tile above it", () => {
        const drawing = buildWallTileDrawing(
            { ...PLAIN_WALL_TILE, top: 3 },
            5,
            11,
            MAP_HEIGHT
        );
        expect(drawing.top).toEqual({
            row: 4,
            gid: 14,
            depth: drawing.slices[0].depth,
        });
    });

    it("covers an avatar in front of the wall with the upper rows of an overlap", () => {
        const drawing = buildWallTileDrawing(
            { ...PLAIN_WALL_TILE, overlap: 8 },
            5,
            1,
            MAP_HEIGHT
        );
        const [body, upper] = drawing.slices;
        expect(body.crop).toEqual({ y: 8, height: 24 });
        expect(upper.crop).toEqual({ y: 0, height: 8 });
        expect(upper.depth).toBeGreaterThan(body.depth);
        // An avatar standing just in front of the tile is under the upper rows.
        expect(avatarDepth(6 * 32 + 8)).toBeLessThan(upper.depth);
        expect(avatarDepth(6 * 32 + 8)).toBeGreaterThan(body.depth);
    });

    it("keeps the foreground over the seated avatar", () => {
        expect(PLACED_ASSET_DEPTH.FOREGROUND).toBeGreaterThan(
            PLACED_ASSET_DEPTH.SEATED_AVATAR
        );
    });

    it("draws a whole tile of overlap as one upper slice", () => {
        const drawing = buildWallTileDrawing(
            { ...PLAIN_WALL_TILE, overlap: 32 },
            2,
            1,
            MAP_HEIGHT
        );
        expect(drawing.slices).toHaveLength(1);
        expect(drawing.slices[0].crop).toEqual({ y: 0, height: 32 });
    });
});
