import type { WallPiece } from "@standin/contracts";
import { WALL_SHEET_ORDER, WALL_STYLE_MAX_FILES } from "../../consts/wallStyle";
import type { WallFileEntry } from "../../types/wallStyleForm";
import { matchWallPiece } from "./matchWallPiece";

// Adds the files to the list. A file whose name says a piece that no other file
// has takes it, and any other waits for the user to choose. Past the eight
// pieces nothing more is taken.
export const addWallEntries = (
    current: readonly WallFileEntry[],
    files: readonly File[]
): WallFileEntry[] => {
    const entries = [...current];
    const taken = new Set(
        entries.flatMap(({ piece }) => (piece ? [piece] : []))
    );

    files.forEach((file) => {
        if (entries.length >= WALL_STYLE_MAX_FILES) return;

        const named = matchWallPiece(file.name);
        const piece = named && !taken.has(named) ? named : null;
        if (piece) taken.add(piece);
        entries.push({ file, piece });
    });

    return entries;
};

// Chooses the piece of a file. A piece belongs to one file, so the file that had
// it is left without one.
export const setWallEntryPiece = (
    current: readonly WallFileEntry[],
    index: number,
    piece: WallPiece | null
): WallFileEntry[] =>
    current.map((entry, position) => {
        if (position === index) return { ...entry, piece };
        if (piece !== null && entry.piece === piece) {
            return { ...entry, piece: null };
        }
        return entry;
    });

export const removeWallEntry = (
    current: readonly WallFileEntry[],
    index: number
): WallFileEntry[] => current.filter((_, position) => position !== index);

// A single file with no piece may be the strip with all eight.
export const isStripCandidate = (entries: readonly WallFileEntry[]): boolean =>
    entries.length === 1 && entries[0].piece === null;

// How many of the eight pieces have a file. A strip has them all.
export const countPlacedPieces = (
    entries: readonly WallFileEntry[]
): number => {
    if (isStripCandidate(entries)) return WALL_STYLE_MAX_FILES;
    return entries.filter(({ piece }) => piece !== null).length;
};

// Gives each file that has no piece the first piece still free, in the order of
// the sheet, so a file whose name says nothing still has a place to be moved
// from.
export const assignFreePieces = (
    entries: readonly WallFileEntry[]
): WallFileEntry[] => {
    const free = WALL_SHEET_ORDER.filter(
        (piece) => !entries.some((entry) => entry.piece === piece)
    );

    return entries.map((entry) => {
        if (entry.piece !== null) return entry;
        const piece = free.shift() ?? null;
        return { ...entry, piece };
    });
};
