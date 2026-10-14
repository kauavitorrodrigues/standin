import { z } from "zod/v4";
import { AssetDefinitionSchema } from "../../assets/schemas/asset-definition.schema";
import { TilesetSchema } from "../../assets/schemas/tileset.schema";
import { MAX_OBJECT_OFFSET } from "../consts/constants";
import { MapRenderErrorMessages as Messages } from "../schemas/consts/error-messages";
import { MapErrorMessages } from "../schemas/consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

// Missing in payloads from before free placement, which means no shift.
const offset = (message: string) =>
    int(message)
        .min(-MAX_OBJECT_OFFSET, { error: message })
        .max(MAX_OBJECT_OFFSET, { error: message })
        .default(0);

export const PlacedAssetSchema = z.object({
    id: z.string({ error: Messages.id.invalid }),
    assetId: z.string({ error: Messages.assetId.invalid }),
    tileX: int(Messages.tile.invalid),
    tileY: int(Messages.tile.invalid),
    offsetX: offset(Messages.offset.invalid),
    offsetY: offset(Messages.offset.invalid),
    parentId: z.string({ error: Messages.parentId.invalid }).nullable(),
    propertyOverrides: z
        .record(z.string(), z.unknown(), { error: Messages.placed.invalid })
        .nullable(),
});

// Who is editing the map right now, if anyone. `by` and `since` come only
// with `locked: true`.
export const MapLockStateSchema = z.object(
    {
        locked: z.boolean({ error: Messages.locked.invalid }),
        by: z
            .object(
                {
                    id: z.string({ error: Messages.lockBy.invalid }),
                    name: z.string({ error: Messages.lockBy.invalid }),
                },
                { error: Messages.lockBy.invalid }
            )
            .optional(),
        since: z.string({ error: Messages.lockSince.invalid }).optional(),
    },
    { error: Messages.lock.invalid }
);

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
    limits: z.object(
        {
            objectsUsed: int(Messages.objectsUsed.invalid),
            objectsMax: int(Messages.objectsMax.invalid),
        },
        { error: Messages.limits.invalid }
    ),
    lock: MapLockStateSchema,
});

export type MapRenderPayload = z.infer<typeof MapRenderPayloadSchema>;
export type MapLockState = z.infer<typeof MapLockStateSchema>;
export type PlacedAsset = z.infer<typeof PlacedAssetSchema>;
