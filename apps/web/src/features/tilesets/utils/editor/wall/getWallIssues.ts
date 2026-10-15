import { validateWallStyles, type TileMeta } from "@standin/contracts";
import { TILESET_MESSAGES } from "../../../consts/messages";
import { WALL_PIECE_LABELS } from "../../../consts/wall";

// What stops the marks from being saved: one line per wall style that lacks
// pieces, with the pieces it lacks. A tileset with no wall style has none.
export const getWallIssues = (meta: TileMeta): string[] =>
    validateWallStyles(meta)
        .filter((report) => !report.isComplete)
        .map((report) => {
            const missing = report.missing
                .map((piece) => WALL_PIECE_LABELS[piece])
                .join(", ");
            return `${TILESET_MESSAGES.WALL_STYLE_INCOMPLETE} "${report.name}": ${TILESET_MESSAGES.WALL_STYLE_MISSING} ${missing}.`;
        });
