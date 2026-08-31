import { z } from "zod/v4";
import { TILED_LAYER_TYPES } from "../enums/tiled-layer-type";
import { TiledLayerErrorMessages } from "./consts/error-messages";
import { ValidatedTiledObjectSchema } from "./tiled-object.schema";

export const TiledTileLayerSchema = z.object({
    type: z.literal(TILED_LAYER_TYPES.TILE_LAYER, {
        error: TiledLayerErrorMessages.type.invalid,
    }),
    name: z.string({ error: TiledLayerErrorMessages.name.required }),
});

export const TiledObjectGroupLayerSchema = z.object({
    type: z.literal(TILED_LAYER_TYPES.OBJECT_GROUP, {
        error: TiledLayerErrorMessages.type.invalid,
    }),
    name: z.string({ error: TiledLayerErrorMessages.name.required }),
    objects: z.array(ValidatedTiledObjectSchema, {
        error: TiledLayerErrorMessages.objects.invalid,
    }),
});

export const TiledLayerSchema = z.union([
    TiledTileLayerSchema,
    TiledObjectGroupLayerSchema,
]);

export type TiledTileLayerSchemaType = z.infer<typeof TiledTileLayerSchema>;

export type TiledObjectGroupLayerSchemaType = z.infer<
    typeof TiledObjectGroupLayerSchema
>;

export type TiledLayerSchemaType = z.infer<typeof TiledLayerSchema>;