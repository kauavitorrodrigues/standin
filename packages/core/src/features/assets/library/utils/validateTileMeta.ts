import {
    BlankDefaultDuplicatedIssue,
    LIBRARY_ISSUE_CODES,
    TileOutOfRangeIssue,
    TileTopOutOfRangeIssue,
    resolveBlankDefaults,
} from "@standin/contracts";
import type { LibraryIssue, TileMeta } from "@standin/contracts";

type BlankDefaultImage = {
    id: string;
    tileCount: number;
    tileMeta: TileMeta | null;
};

/** Every tile and wall top index of `tileMeta` has to sit inside the tileset. */
export const findTileMetaRangeIssues = (
    tileMeta: TileMeta,
    tileCount: number
): LibraryIssue[] =>
    Object.entries(tileMeta).flatMap(([index, tile]) => {
        const issues: LibraryIssue[] = [];
        if (Number(index) >= tileCount) {
            issues.push(new TileOutOfRangeIssue(index, tileCount));
        }
        if (tile.top !== undefined && tile.top >= tileCount) {
            issues.push(new TileTopOutOfRangeIssue(index, tile.top, tileCount));
        }
        return issues;
    });

/**
 * At most one FLOOR and one WALL `blankDefault` across the global images.
 * `images` is the whole global set as it would be after the write.
 */
export const findBlankDefaultIssues = (
    images: BlankDefaultImage[]
): LibraryIssue[] =>
    resolveBlankDefaults(images).errors.some(
        ({ code }) => code === LIBRARY_ISSUE_CODES.BLANK_DEFAULT_DUPLICATED
    )
        ? [new BlankDefaultDuplicatedIssue()]
        : [];
