import { describe, expect, it } from "vitest";
import { WALL_PIECES } from "@standin/contracts";
import { moveWallPiece } from "../wallStyle/moveWallPiece";

const file = (name: string) => new File([""], name);

describe("moveWallPiece", () => {
    it("moves a file to a free piece", () => {
        const a = file("a.png");
        const next = moveWallPiece(
            [{ file: a, piece: WALL_PIECES.N }],
            WALL_PIECES.N,
            WALL_PIECES.S
        );
        expect(next).toEqual([{ file: a, piece: WALL_PIECES.S }]);
    });

    it("trades places when the piece is taken", () => {
        const a = file("a.png");
        const b = file("b.png");
        const next = moveWallPiece(
            [
                { file: a, piece: WALL_PIECES.N },
                { file: b, piece: WALL_PIECES.S },
            ],
            WALL_PIECES.N,
            WALL_PIECES.S
        );
        expect(next).toEqual([
            { file: a, piece: WALL_PIECES.S },
            { file: b, piece: WALL_PIECES.N },
        ]);
    });
});
