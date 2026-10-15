import { z } from "zod/v4";
import {
    LIBRARY_TILESET_PROGRESSES,
    MAX_LIBRARY_SEARCH_LENGTH,
} from "../consts/library";
import { LibraryTilesetQueryErrorMessages as Messages } from "./consts/error-messages";

// Query string of `GET /library/tilesets`. Every filter is optional and the
// server does the search and the filtering.
export const LibraryTilesetQuerySchema = z.object({
    search: z
        .string({ error: Messages.search.invalid })
        .trim()
        .max(MAX_LIBRARY_SEARCH_LENGTH, { error: Messages.search.invalid })
        .optional(),
    inUse: z
        .enum(["true", "false"], { error: Messages.inUse.invalid })
        .transform((value) => value === "true")
        .optional(),
    progress: z
        .enum(LIBRARY_TILESET_PROGRESSES, { error: Messages.progress.invalid })
        .optional(),
});

export type LibraryTilesetQuerySchemaType = z.infer<
    typeof LibraryTilesetQuerySchema
>;
