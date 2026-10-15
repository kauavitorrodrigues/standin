import type { z } from "zod/v4";
import type { assetAnimationSchema } from "../schemas/asset-animation.schema";
import type { AssetDefinitionSchema } from "../schemas/asset-definition.schema";

export type AssetAnimation = z.infer<typeof assetAnimationSchema>;
export type AssetDefinition = z.infer<typeof AssetDefinitionSchema>;
export * from "./library";
