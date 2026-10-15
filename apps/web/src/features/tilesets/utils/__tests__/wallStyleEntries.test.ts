import { describe, expect, it } from "vitest";
import { WALL_PIECES } from "@standin/contracts";
import {
    addWallEntries,
    assignFreePieces,
    countPlacedPieces,
    isStripCandidate,
    removeWallEntry,
    setWallEntryPiece,
} from "../wallStyle/placeEntries";
import { setWallPieceFile } from "../wallStyle/setWallPieceFile";

const file = (name: string) => new File([""], name);

describe("addWallEntries", () => {
    it("places the files whose name says a piece and leaves the others open", () => {
        const entries = addWallEntries(
            [],
            [file("a n.png"), file("photo.png")]
        );
        expect(entries.map(({ piece }) => piece)).toEqual(["n", null]);
    });

    it("gives a piece to one file only", () => {
        const entries = addWallEntries([], [file("x n.png"), file("y n.png")]);
        expect(entries.map(({ piece }) => piece)).toEqual(["n", null]);
    });

    it("takes no more than eight files", () => {
        const many = Array.from({ length: 12 }, (_, index) =>
            file(`file${index}.png`)
        );
        expect(addWallEntries([], many)).toHaveLength(8);
    });
});

describe("setWallEntryPiece", () => {
    it("moves a piece to the file that was just given it", () => {
        const current = addWallEntries([], [file("a n.png"), file("b.png")]);
        const next = setWallEntryPiece(current, 1, "n");
        expect(next.map(({ piece }) => piece)).toEqual([null, "n"]);
    });
});

describe("removeWallEntry", () => {
    it("drops the file at the index", () => {
        const current = addWallEntries([], [file("a n.png"), file("b e.png")]);
        expect(removeWallEntry(current, 0).map(({ piece }) => piece)).toEqual([
            "e",
        ]);
    });
});

describe("countPlacedPieces", () => {
    it("counts the pieces with a file, and every piece for a strip", () => {
        const some = addWallEntries([], [file("a n.png"), file("b.png")]);
        expect(countPlacedPieces(some)).toBe(1);

        const strip = addWallEntries([], [file("tira.png")]);
        expect(isStripCandidate(strip)).toBe(true);
        expect(countPlacedPieces(strip)).toBe(8);
    });
});

describe("setWallPieceFile", () => {
    it("replaces the file of a piece and takes it out with null", () => {
        const current = addWallEntries([], [file("a n.png"), file("b e.png")]);
        const replaced = setWallPieceFile(current, "n", file("new.png"));
        expect(replaced.find(({ piece }) => piece === "n")?.file.name).toBe(
            "new.png"
        );
        expect(replaced).toHaveLength(2);
        expect(setWallPieceFile(replaced, "e", null)).toHaveLength(1);
    });

    it("leaves a strip aside when a piece is chosen by hand", () => {
        const strip = addWallEntries([], [file("tira.png")]);
        const next = setWallPieceFile(strip, "s", file("south.png"));
        expect(next).toHaveLength(1);
        expect(next[0].piece).toBe("s");
    });
});

describe("assignFreePieces", () => {
    it("gives files without a piece the first free ones in sheet order", () => {
        const named = new File([""], "x n.png");
        const a = new File([""], "a.png");
        const next = assignFreePieces([
            { file: named, piece: WALL_PIECES.NW },
            { file: a, piece: null },
        ]);
        expect(next[1].piece).toBe(WALL_PIECES.N);
    });
});
