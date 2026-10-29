import { z } from "zod/v4";
import { MAX_MAP_TILES, MAX_OBJECT_OFFSET } from "@standin/contracts";

// A coordinate or a size, in tiles. The map bounds are checked on compile,
// where the size of the map is known.
export const coordinate = z
    .number()
    .int()
    .min(0)
    .max(MAX_MAP_TILES - 1);
export const length = (min: number) =>
    z.number().int().min(min).max(MAX_MAP_TILES);

// How far an object moves off its tile, in pixels.
export const offset = z
    .number()
    .int()
    .min(-MAX_OBJECT_OFFSET)
    .max(MAX_OBJECT_OFFSET);

// A library key, or a tileset id or name.
export const reference = z.string().min(1);

export const TileRefSchema = z.strictObject({
    tileset: reference.describe("Tileset id or name."),
    tileIndex: z.number().int().min(0).describe("Index of the tile."),
});

export const WallStyleSchema = z
    .strictObject({
        tileset: reference.describe("Tileset id or name."),
        style: z
            .string()
            .min(1)
            .optional()
            .describe("Wall style named in the tile meta of the tileset."),
        tileIndex: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("One tile of the style, instead of the style name."),
    })
    .refine(
        (walls) =>
            (walls.style === undefined) !== (walls.tileIndex === undefined),
        {
            error: "Give either style or tileIndex.",
        }
    );

export const PointSchema = z.strictObject({ x: coordinate, y: coordinate });
