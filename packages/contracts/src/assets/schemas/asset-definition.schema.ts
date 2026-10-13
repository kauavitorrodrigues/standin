import { z } from "zod/v4";
import { ASSET_ACTIONS } from "../enums/asset-action";
import { ASSET_CATEGORIES } from "../enums/asset-category";
import { ASSET_PLACEMENTS } from "../enums/asset-placement";
import { ASSET_ROTATIONS } from "../enums/asset-rotation";
import { ASSET_TYPES } from "../enums/asset-type";
import { assetAnimationSchema } from "./asset-animation.schema";
import { assetColorHexSchema, assetColorKeySchema } from "./asset-color.schema";
import { AssetErrorMessages as Messages } from "./consts/error-messages";
import { TilesetSchema } from "./tileset.schema";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

// One placeable asset as the payloads and the client see it: one PNG, one
// texture. `sprite` is the size of one frame.
export const AssetDefinitionSchema = z
    .object({
        id: z.string({ error: Messages.id.invalid }),
        key: z.string({ error: Messages.key.invalid }),
        name: z.string({ error: Messages.name.invalid }),
        type: z.enum(ASSET_TYPES, { error: Messages.type.invalid }),
        category: z.enum(ASSET_CATEGORIES, {
            error: Messages.category.invalid,
        }),
        // Null when the row is a base asset.
        baseAssetId: z
            .string({ error: Messages.baseAssetId.invalid })
            .nullable(),
        rotation: z
            .enum(ASSET_ROTATIONS, { error: Messages.rotation.invalid })
            .nullable(),
        colorKey: assetColorKeySchema.nullable(),
        colorHex: assetColorHexSchema.nullable(),
        url: z.string({ error: Messages.url.invalid }),
        sprite: z.object(
            {
                w: int(Messages.sprite.invalid),
                h: int(Messages.sprite.invalid),
            },
            { error: Messages.sprite.invalid }
        ),
        footprint: z.object(
            {
                w: int(Messages.footprint.invalid),
                h: int(Messages.footprint.invalid),
                offsetX: int(Messages.footprint.invalid),
            },
            { error: Messages.footprint.invalid }
        ),
        placement: z.enum(ASSET_PLACEMENTS, {
            error: Messages.placement.invalid,
        }),
        surfaceHeightPx: int(Messages.surfaceHeightPx.invalid),
        solid: z.boolean({ error: Messages.solid.invalid }),
        action: z
            .enum(ASSET_ACTIONS, { error: Messages.action.invalid })
            .nullable(),
        actionParams: z
            .record(z.string(), z.unknown(), {
                error: Messages.actionParams.invalid,
            })
            .nullable(),
        promptText: z.string({ error: Messages.promptText.invalid }).nullable(),
        animation: assetAnimationSchema.nullable(),
    })
    .superRefine((asset, ctx) => {
        if ((asset.colorKey === null) !== (asset.colorHex === null)) {
            ctx.addIssue({
                code: "custom",
                path: ["colorKey"],
                message: Messages.colorFields.inconsistent,
            });
        }
    });

export const AssetLibrarySchema = z.object({
    tilesets: z.array(TilesetSchema, { error: Messages.tilesets.invalid }),
    assets: z.array(AssetDefinitionSchema, { error: Messages.assets.invalid }),
});
