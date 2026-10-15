import { z } from "zod/v4";
import { AssetDefinitionSchema } from "../../assets/schemas/asset-definition.schema";
import { TilesetSchema } from "../../assets/schemas/tileset.schema";
import { MapRenderErrorMessages as Messages } from "../schemas/consts/error-messages";
import { MapErrorMessages } from "../schemas/consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

export const PlacedAssetSchema = z.object({
    id: z.string({ error: Messages.id.invalid }),
    assetId: z.string({ error: Messages.assetId.invalid }),
    tileX: int(Messages.tile.invalid),
    tileY: int(Messages.tile.invalid),
    parentId: z.string({ error: Messages.parentId.invalid }).nullable(),
    propertyOverrides: z
        .record(z.string(), z.unknown(), { error: Messages.placed.invalid })
        .nullable(),
});

export const MapRenderPayloadSchema = z.object({
    map: z.object(
        {
            id: z.string({ error: MapErrorMessages.id.invalid }),
            width: int(MapErrorMessages.width.invalid),
            height: int(MapErrorMessages.height.invalid),
            tileSize: int(MapErrorMessages.tileSize.invalid),
            layoutVersion: int(Messages.layoutVersion.invalid),
            // Tiled JSON with the `tilesets` array completed by the server.
            layout: z.record(z.string(), z.unknown(), {
                error: MapErrorMessages.layout.invalid,
            }),
        },
        { error: Messages.map.invalid }
    ),
    // Every tileset the layout uses.
    tilesets: z.array(TilesetSchema, { error: Messages.tilesets.invalid }),
    // Only the assets used in the map, deleted ones included.
    assets: z.array(AssetDefinitionSchema, { error: Messages.assets.invalid }),
    placed: z.array(PlacedAssetSchema, { error: Messages.placed.invalid }),
    desks: z.array(
        z.object({
            mapAssetId: z.string({ error: Messages.id.invalid }),
            userId: z.string({ error: Messages.userId.invalid }),
        }),
        { error: Messages.desks.invalid }
    ),
    access: z.object(
        {
            canEdit: z.boolean({ error: Messages.canEdit.invalid }),
            ownDeskMapAssetId: z
                .string({ error: Messages.ownDesk.invalid })
                .nullable(),
        },
        { error: Messages.access.invalid }
    ),
});

export type MapRenderPayload = z.infer<typeof MapRenderPayloadSchema>;
export type PlacedAsset = z.infer<typeof PlacedAssetSchema>;
