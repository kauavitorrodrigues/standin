import { SOUNDBOARD_FETCH_AHEAD_ROWS } from "../consts/grid";
import type { SoundboardClipScope } from "@standin/contracts";
import type { ClipRow } from "../types/row";

/**
 * The groups whose next page is due: the row that stands for "more of this
 * group" is within reach of the last row on screen. A folded group is left out.
 */
export const findScopesToFetch = (
    rows: readonly ClipRow[],
    lastVisibleIndex: number
): SoundboardClipScope[] =>
    rows.flatMap((row, index) => {
        if (row.kind !== "state" || row.state !== "more") return [];
        // A folded group is not looked at, so it asks for nothing.
        if (row.isCollapsed) return [];
        if (index > lastVisibleIndex + SOUNDBOARD_FETCH_AHEAD_ROWS) return [];
        return [row.scope];
    });
