import { z } from "zod/v4";
import { TiledMapJsonErrorMessages } from "./consts/error-messages";
import { TiledLayerSchema } from "./tiled-layer.schema";

export const TiledTilesetRefSchema = z.object({
    name: z.string({ error: TiledMapJsonErrorMessages.name.required }),
});

export const TiledMapJsonSchema = z.object({
    layers: z.array(TiledLayerSchema, {
        error: TiledMapJsonErrorMessages.layers.invalid,
    }),
    tilesets: z.array(TiledTilesetRefSchema, {
        error: TiledMapJsonErrorMessages.tilesets.invalid,
    }),
});

export type TiledTilesetRefSchemaType = z.infer<typeof TiledTilesetRefSchema>;
export type TiledMapJsonSchemaType = z.infer<typeof TiledMapJsonSchema>;
