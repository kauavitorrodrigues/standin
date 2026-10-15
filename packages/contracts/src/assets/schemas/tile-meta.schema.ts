import { z } from "zod/v4";
import { TILE_CATEGORIES } from "../enums/tile-category";
import { WALL_EDGE_VALUES } from "../enums/wall-edge";
import { WALL_OVERLAP_MAX, WALL_STYLE_NAME_MAX } from "../consts/wall";
import { SOLID_MASK_SUBDIVISION } from "../consts/library";
import { getWallPiece } from "../utils/wallPiece";
import { TileMetaErrorMessages } from "./consts/error-messages";
import { footprintMaskSchema } from "./footprint-mask.schema";

const isWallSolidMaskFitting = (mask: boolean[][]): boolean =>
    mask.length === SOLID_MASK_SUBDIVISION &&
    mask.every((row) => row.length === SOLID_MASK_SUBDIVISION) &&
    mask.some((row) => row.some(Boolean));

export const TileMetaEntrySchema = z
    .object({
        category: z.enum(TILE_CATEGORIES, {
            error: TileMetaErrorMessages.category.invalid,
        }),
        solid: z
            .boolean({ error: TileMetaErrorMessages.solid.invalid })
            .optional(),
        // Marks the tile the blank map generator uses. At most one FLOOR and
        // one WALL tile across the global images.
        blankDefault: z
            .boolean({ error: TileMetaErrorMessages.blankDefault.invalid })
            .optional(),
        // Local index of the tile drawn above a WALL tile.
        top: z
            .number({ error: TileMetaErrorMessages.top.invalid })
            .int({ error: TileMetaErrorMessages.top.invalid })
            .min(0, { error: TileMetaErrorMessages.top.invalid })
            .optional(),
        // The edges of the tile a wall piece draws. Only the eight sets a wall
        // style is made of are valid (see `getWallPiece`).
        edges: z
            .array(
                z.enum(WALL_EDGE_VALUES, {
                    error: TileMetaErrorMessages.edges.invalid,
                }),
                { error: TileMetaErrorMessages.edges.invalid }
            )
            .optional(),
        // The wall style the piece belongs to, such as "Tijolo". A style is
        // complete when it has the eight pieces.
        style: z
            .string({ error: TileMetaErrorMessages.style.invalid })
            .trim()
            .min(1, { error: TileMetaErrorMessages.style.invalid })
            .max(WALL_STYLE_NAME_MAX, {
                error: TileMetaErrorMessages.style.invalid,
            })
            .optional(),
        // Rows of the tile, from the top, that draw over an avatar behind the
        // wall. For a piece that has no `top`.
        overlap: z
            .number({ error: TileMetaErrorMessages.overlap.invalid })
            .int({ error: TileMetaErrorMessages.overlap.invalid })
            .min(0, { error: TileMetaErrorMessages.overlap.invalid })
            .max(WALL_OVERLAP_MAX, {
                error: TileMetaErrorMessages.overlap.invalid,
            })
            .optional(),
        // The cells of the tile that block, on the grid of the asset collision
        // mask. A wall tile without it blocks the whole tile.
        solidMask: footprintMaskSchema(
            TileMetaErrorMessages.wallSolidMask.invalid
        ).optional(),
    })
    .superRefine((entry, context) => {
        const hasWallFields =
            entry.edges !== undefined ||
            entry.style !== undefined ||
            entry.overlap !== undefined ||
            entry.solidMask !== undefined;
        if (hasWallFields && entry.category !== TILE_CATEGORIES.WALL) {
            context.addIssue({
                code: "custom",
                message: TileMetaErrorMessages.wallOnly.invalid,
            });
            return;
        }
        if (
            entry.edges !== undefined &&
            getWallPiece(entry.edges) === null
        ) {
            context.addIssue({
                code: "custom",
                path: ["edges"],
                message: TileMetaErrorMessages.edges.invalid,
            });
        }
        if (entry.edges !== undefined && entry.style === undefined) {
            context.addIssue({
                code: "custom",
                path: ["style"],
                message: TileMetaErrorMessages.styleRequired.invalid,
            });
        }
        if (
            entry.solidMask !== undefined &&
            !isWallSolidMaskFitting(entry.solidMask)
        ) {
            context.addIssue({
                code: "custom",
                path: ["solidMask"],
                message: TileMetaErrorMessages.wallSolidMask.invalid,
            });
        }
    });

// Keyed by the local tile index of the image (base 0, the Tiled `id`).
export const TileMetaSchema = z.record(
    z.string().regex(/^\d+$/, { error: TileMetaErrorMessages.index.invalid }),
    TileMetaEntrySchema,
    { error: TileMetaErrorMessages.meta.invalid }
);

export type TileMeta = z.infer<typeof TileMetaSchema>;
