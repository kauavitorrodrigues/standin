import type { WallPiece } from "@standin/contracts";
import type { WallFileEntry } from "../../types/wallStyleForm";

// Moves the file of a piece to another one. If the other piece had a file, the
// two trade places, so no file is ever left without a piece.
export const moveWallPiece = (
    current: readonly WallFileEntry[],
    from: WallPiece,
    to: WallPiece
): WallFileEntry[] => {
    if (from === to) return [...current];

    return current.map((entry) => {
        if (entry.piece === from) return { ...entry, piece: to };
        if (entry.piece === to) return { ...entry, piece: from };
        return entry;
    });
};
