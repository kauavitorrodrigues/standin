import type { WallPiece } from "@standin/contracts";
import type { WallFileEntry } from "../../types/wallStyleForm";
import { isStripCandidate } from "./placeEntries";

// Gives a piece its file, in place of the one it had. A strip stands for all
// of the pieces, so choosing one by hand leaves the strip aside. A null file
// takes the piece back out.
export const setWallPieceFile = (
    current: readonly WallFileEntry[],
    piece: WallPiece,
    file: File | null
): WallFileEntry[] => {
    const kept = isStripCandidate(current)
        ? []
        : current.filter((entry) => entry.piece !== piece);

    return file ? [...kept, { file, piece }] : kept;
};
