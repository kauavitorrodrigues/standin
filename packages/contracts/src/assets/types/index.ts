import type { z } from "zod/v4";
import type { assetAnimationSchema } from "../schemas/asset-animation.schema";
import type {
    AssetDefinitionSchema,
    AssetLibrarySchema,
} from "../schemas/asset-definition.schema";
import type { TilesetSchema } from "../schemas/tileset.schema";

export type AssetAnimation = z.infer<typeof assetAnimationSchema>;
export type AssetDefinition = z.infer<typeof AssetDefinitionSchema>;
export type AssetLibrary = z.infer<typeof AssetLibrarySchema>;
export type Tileset = z.infer<typeof TilesetSchema>;
export * from "./library";
