import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { AVATAR, AVATAR_SHEET_PX } from "@standin/contracts";
import { GHOST_LEG_HEIGHT, GHOST_TORSO_ROWS } from "../../../consts/sheet-art";
import { buildGhostSheet, buildGhostSprite } from "../buildGhostSheet";
import { encodeSheet } from "../encodeSheet";

const PUBLIC_DIR = resolve(
    import.meta.dirname,
    "../../../../../../public/avatar"
);

const readSheet = (file: string): PNG =>
    PNG.sync.read(readFileSync(resolve(PUBLIC_DIR, file)));

describe("avatar sheets", () => {
    it("draws the ghost as large as the visible body", () => {
        const sprite = buildGhostSprite("down");

        expect(sprite.w).toBe(AVATAR.visible.w);
        expect(sprite.h).toBe(AVATAR.visible.h);
        expect(
            GHOST_TORSO_ROWS.down.every((row) => row.length === sprite.w - 2)
        ).toBe(true);
        expect(GHOST_TORSO_ROWS.down.length + GHOST_LEG_HEIGHT).toBe(
            sprite.h - 2
        );
        expect(GHOST_TORSO_ROWS.right.length + GHOST_LEG_HEIGHT).toBe(
            sprite.h - 2
        );
    });

    it("builds a sheet with exactly the size of the grid", () => {
        const expected = AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * 4;

        expect(buildGhostSheet()).toHaveLength(expected);
    });

    it("builds the same bytes every time", () => {
        expect(
            encodeSheet(buildGhostSheet()).equals(
                encodeSheet(buildGhostSheet())
            )
        ).toBe(true);
    });

    it("keeps ghost-sheet.png in public equal to what the generator writes", () => {
        const png = readSheet("ghost-sheet.png");

        expect(png.width).toBe(AVATAR_SHEET_PX.w);
        expect(png.height).toBe(AVATAR_SHEET_PX.h);
        expect(
            Buffer.from(png.data).equals(Buffer.from(buildGhostSheet()))
        ).toBe(true);
    });

    it("keeps the feet of the ghost on the anchor of the first frame", () => {
        const png = readSheet("ghost-sheet.png");
        const alphaAt = (x: number, y: number): number =>
            png.data[(y * png.width + x) * 4 + 3];

        expect(alphaAt(AVATAR.anchor.x - 4, AVATAR.anchor.y - 1)).toBe(255);
        expect(alphaAt(AVATAR.anchor.x - 4, AVATAR.anchor.y)).toBe(0);
    });
});
