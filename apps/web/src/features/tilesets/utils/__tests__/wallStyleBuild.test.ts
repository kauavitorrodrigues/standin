import { describe, expect, it } from "vitest";
import { TILE_SIZE, WALL_PIECES, validateWallStyles } from "@standin/contracts";
import type { WallPiece } from "@standin/contracts";
import type { PixelData } from "@/features/assets/utils/detectSolidMask";
import { WALL_SHEET_ORDER } from "../../consts/wallStyle";
import { buildWallSheet } from "../wallStyle/buildWallSheet";
import { getPieceHeightTiles } from "../wallStyle/getPieceHeightTiles";
import { matchWallFiles, matchWallPiece } from "../wallStyle/matchWallPiece";
import {
    WALL_STRIP_HEIGHT,
    WALL_STRIP_WIDTH,
    isWallStrip,
    splitWallStrip,
} from "../wallStyle/splitWallStrip";

type Fill = (x: number, y: number) => boolean;

const paint = (width: number, height: number, fill: Fill): PixelData => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (!fill(x, y)) continue;
            const at = (y * width + x) * 4;
            data[at] = 90;
            data[at + 1] = 100;
            data[at + 2] = 140;
            data[at + 3] = 255;
        }
    }
    return { width, height, data };
};

// A side piece is a 4 px trace at one edge, any other piece is drawn all over.
const buildPiece = (piece: WallPiece): PixelData => {
    const height = TILE_SIZE * getPieceHeightTiles(piece);
    if (piece === WALL_PIECES.E) {
        return paint(TILE_SIZE, height, (x) => x >= TILE_SIZE - 4);
    }
    if (piece === WALL_PIECES.W) {
        return paint(TILE_SIZE, height, (x) => x < 4);
    }
    return paint(TILE_SIZE, height, () => true);
};

const buildImages = () =>
    Object.fromEntries(
        WALL_SHEET_ORDER.map((piece) => [piece, buildPiece(piece)])
    ) as Record<WallPiece, PixelData>;

describe("matchWallPiece", () => {
    it("reads the compass name at the end of the file name", () => {
        expect(matchWallPiece("thin wall ne.png")).toBe("ne");
        expect(matchWallPiece("nw.png")).toBe("nw");
        expect(matchWallPiece("Thin-Wall_S.PNG")).toBe("s");
        expect(matchWallPiece("thin wall n.png")).toBe("n");
    });

    it("refuses a name that says no piece", () => {
        expect(matchWallPiece("tilesheet.png")).toBeNull();
        expect(matchWallPiece("wall.png")).toBeNull();
        expect(matchWallPiece("thin wall e.jpg")).toBeNull();
    });
});

describe("matchWallFiles", () => {
    it("sorts files by piece and sets aside the ones it cannot place", () => {
        const file = (name: string) => new File([""], name);
        const { byPiece, unmatched } = matchWallFiles([
            file("thin wall n.png"),
            file("thin wall ne.png"),
            file("notes.png"),
            file("another n.png"),
        ]);
        expect(Object.keys(byPiece).sort()).toEqual(["n", "ne"]);
        expect(unmatched).toEqual(["notes.png", "another n.png"]);
    });
});

describe("buildWallSheet", () => {
    it("builds a complete style from the eight pieces", () => {
        const result = buildWallSheet({ images: buildImages(), style: "Azul" });
        if (!result.ok) throw new Error(JSON.stringify(result.issues));

        expect(result.sheet.width).toBe(8 * TILE_SIZE);
        expect(result.sheet.height).toBe(2 * TILE_SIZE);
        const [report] = validateWallStyles(result.tileMeta);
        expect(report.name).toBe("Azul");
        expect(report.isComplete).toBe(true);
    });

    it("points each tall piece at its cap and gives the sides a trace mask", () => {
        const result = buildWallSheet({ images: buildImages(), style: "Azul" });
        if (!result.ok) throw new Error("expected a sheet");
        const entries = Object.values(result.tileMeta);

        expect(entries.filter((entry) => entry.top !== undefined)).toHaveLength(
            6
        );
        expect(entries.filter((entry) => entry.solid)).toHaveLength(6);
        const masks = entries.filter((entry) => entry.solidMask);
        expect(masks).toHaveLength(2);
        masks.forEach((entry) => {
            const blocked = entry.solidMask?.flat().filter(Boolean).length;
            expect(blocked).toBe(4);
        });
    });

    it("reports what is missing, the wrong sizes and the empty pieces", () => {
        const images = buildImages() as Partial<Record<WallPiece, PixelData>>;
        delete images[WALL_PIECES.NE];
        images[WALL_PIECES.S] = paint(TILE_SIZE, TILE_SIZE, () => true);
        images[WALL_PIECES.E] = paint(TILE_SIZE, TILE_SIZE, () => false);

        const result = buildWallSheet({ images, style: "Azul" });
        if (result.ok) throw new Error("expected issues");
        expect(result.issues).toEqual([
            { piece: "ne", kind: "missing" },
            { piece: "e", kind: "empty" },
            { piece: "s", kind: "size" },
        ]);
    });
});

describe("splitWallStrip", () => {
    it("cuts a strip in the standard layout back into the eight pieces", () => {
        const built = buildWallSheet({ images: buildImages(), style: "Azul" });
        if (!built.ok) throw new Error("expected a sheet");
        const strip: PixelData = built.sheet;
        expect(isWallStrip(strip)).toBe(true);
        expect(strip.width).toBe(WALL_STRIP_WIDTH);
        expect(strip.height).toBe(WALL_STRIP_HEIGHT);

        const again = buildWallSheet({
            images: splitWallStrip(strip),
            style: "Azul",
        });
        if (!again.ok) throw new Error(JSON.stringify(again.issues));
        expect(again.tileMeta).toEqual(built.tileMeta);
        expect(Array.from(again.sheet.data)).toEqual(
            Array.from(built.sheet.data)
        );
    });
});
