import type { CommandOutput, LibraryListResult } from "../../types";
import { LIBRARY_HEADINGS, LIBRARY_MESSAGES } from "./consts";

export const buildLibraryListOutput = (
    result: LibraryListResult
): CommandOutput => {
    const lines: string[] = [
        LIBRARY_MESSAGES.heading(
            LIBRARY_HEADINGS.TILESETS,
            result.tilesets.length
        ),
        ...result.tilesets.map(({ key, name, tileCount }) =>
            LIBRARY_MESSAGES.tileset(key, name, tileCount)
        ),
        LIBRARY_MESSAGES.heading(LIBRARY_HEADINGS.ASSETS, result.assets.length),
        ...result.assets.map(({ key, name, category }) =>
            LIBRARY_MESSAGES.asset(key, name, category)
        ),
        LIBRARY_MESSAGES.heading(LIBRARY_HEADINGS.AREAS, result.areas.length),
        ...result.areas.map(({ id, name, width, height }) =>
            LIBRARY_MESSAGES.area(name, width, height, id)
        ),
    ];
    return { result, lines };
};
