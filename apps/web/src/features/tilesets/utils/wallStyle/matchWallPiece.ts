import type { WallPiece } from "@standin/contracts";

// The compass name at the end of the file name, such as "thin wall ne.png" or
// "n.png". The two letter names come first so "ne" is not read as "n".
const PIECE_NAME = /(?:^|[^a-z0-9])(nw|ne|sw|se|n|e|s|w)\.png$/i;

export const matchWallPiece = (fileName: string): WallPiece | null => {
    const match = PIECE_NAME.exec(fileName.trim());
    if (!match) return null;

    return match[1].toLowerCase() as WallPiece;
};

export type WallFileMatch = {
    byPiece: Partial<Record<WallPiece, File>>;
    // Files whose name does not say a piece, or that repeat one.
    unmatched: string[];
};

// Sorts the chosen files by the piece their name says.
export const matchWallFiles = (files: readonly File[]): WallFileMatch => {
    const byPiece: WallFileMatch["byPiece"] = {};
    const unmatched: string[] = [];

    files.forEach((file) => {
        const piece = matchWallPiece(file.name);
        if (!piece || byPiece[piece]) {
            unmatched.push(file.name);
            return;
        }
        byPiece[piece] = file;
    });

    return { byPiece, unmatched };
};
