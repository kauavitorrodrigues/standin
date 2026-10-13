import { z } from "zod/v4";
import { TILE_CATEGORIES } from "../enums/tile-category";
import { TileMetaErrorMessages } from "./consts/error-messages";

export const TileMetaEntrySchema = z.object({
    category: z.enum(TILE_CATEGORIES, {
        error: TileMetaErrorMessages.category.invalid,
    }),
    solid: z.boolean({ error: TileMetaErrorMessages.solid.invalid }).optional(),
    // Marks the tile the blank map generator uses. At most one FLOOR and one
    // WALL tile across the global images.
    blankDefault: z
        .boolean({ error: TileMetaErrorMessages.blankDefault.invalid })
        .optional(),
    // Local index of the tile drawn above a WALL tile.
    top: z
        .number({ error: TileMetaErrorMessages.top.invalid })
        .int({ error: TileMetaErrorMessages.top.invalid })
        .min(0, { error: TileMetaErrorMessages.top.invalid })
        .optional(),
});

// Keyed by the local tile index of the image (base 0, the Tiled `id`).
export const TileMetaSchema = z.record(
    z.string().regex(/^\d+$/, { error: TileMetaErrorMessages.index.invalid }),
    TileMetaEntrySchema,
    { error: TileMetaErrorMessages.meta.invalid }
);

export type TileMeta = z.infer<typeof TileMetaSchema>;
