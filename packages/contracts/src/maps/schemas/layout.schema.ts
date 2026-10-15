import { z } from "zod/v4";
import { TILE_SIZE } from "../consts/constants";
import { TILED_LAYER_TYPES } from "../enums/tiled-layer-type";
import { MapLayoutErrorMessages as Messages } from "./consts/error-messages";

export const LAYOUT_LAYER_NAMES = {
    GROUND: "ground",
    WALLS: "walls",
    FURNITURE: "furniture",
    FOREGROUND: "foreground",
} as const;

export const LAYOUT_ZONES_LAYER_NAME = "zones";

export const LAYOUT_ZONE_KINDS = {
    AREA: "area",
    SPAWN: "spawn",
    PRIVATE: "private",
    PORTAL: "portal",
    SPOTLIGHT: "spotlight",
} as const;

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

export const LayoutTilesetSchema = z.object({
    // Id of the asset image that holds the tileset. Never reordered or
    // removed from a map in use, because the gids depend on it.
    name: z.string({ error: Messages.tileset.name.invalid }),
    firstgid: int(Messages.tileset.firstGid.invalid).positive({
        error: Messages.tileset.firstGid.invalid,
    }),
});

export const LayoutTileLayerSchema = z.object({
    id: int(Messages.layer.id.invalid),
    type: z.literal(TILED_LAYER_TYPES.TILE_LAYER, {
        error: Messages.layer.type.invalid,
    }),
    name: z.string({ error: Messages.layer.name.invalid }),
    x: z.number().default(0),
    y: z.number().default(0),
    width: int(Messages.layer.width.invalid),
    height: int(Messages.layer.height.invalid),
    visible: z.boolean({ error: Messages.layer.visible.invalid }).default(true),
    opacity: z.number({ error: Messages.layer.opacity.invalid }).default(1),
    data: z.array(int(Messages.layer.data.tile), {
        error: Messages.layer.data.invalid,
    }),
});

export const LayoutObjectPropertySchema = z.object({
    name: z.string({ error: Messages.object.properties.invalid }),
    type: z.string({ error: Messages.object.properties.invalid }),
    value: z.unknown(),
});

export const LayoutObjectSchema = z.object({
    id: int(Messages.object.id.invalid),
    name: z.string({ error: Messages.object.name.invalid }),
    type: z.string({ error: Messages.object.type.invalid }),
    x: z.number({ error: Messages.object.x.invalid }),
    y: z.number({ error: Messages.object.y.invalid }),
    width: z.number({ error: Messages.object.width.invalid }),
    height: z.number({ error: Messages.object.height.invalid }),
    rotation: z.number({ error: Messages.object.rotation.invalid }),
    visible: z
        .boolean({ error: Messages.object.visible.invalid })
        .default(true),
    polygon: z
        .array(
            z.object({
                x: z.number({ error: Messages.object.point.invalid }),
                y: z.number({ error: Messages.object.point.invalid }),
            }),
            { error: Messages.object.polygon.invalid }
        )
        .optional(),
    properties: z.array(LayoutObjectPropertySchema, {
        error: Messages.object.properties.invalid,
    }),
});

export const LayoutObjectGroupSchema = z.object({
    id: int(Messages.layer.id.invalid),
    type: z.literal(TILED_LAYER_TYPES.OBJECT_GROUP, {
        error: Messages.layer.type.invalid,
    }),
    name: z.string({ error: Messages.layer.name.invalid }),
    x: z.number().default(0),
    y: z.number().default(0),
    visible: z.boolean({ error: Messages.layer.visible.invalid }).default(true),
    opacity: z.number({ error: Messages.layer.opacity.invalid }).default(1),
    objects: z.array(LayoutObjectSchema, {
        error: Messages.object.objects.invalid,
    }),
});

export const MapLayoutSchema = z.object({
    orientation: z.literal("orthogonal", {
        error: Messages.orientation.invalid,
    }),
    renderorder: z
        .literal("right-down", { error: Messages.renderOrder.invalid })
        .default("right-down"),
    infinite: z.literal(false, { error: Messages.infinite.invalid }),
    tilewidth: z.literal(TILE_SIZE, { error: Messages.tileSize.invalid }),
    tileheight: z.literal(TILE_SIZE, { error: Messages.tileSize.invalid }),
    width: int(Messages.width.invalid),
    height: int(Messages.height.invalid),
    backgroundcolor: z
        .string({ error: Messages.backgroundColor.invalid })
        .optional(),
    nextlayerid: int(Messages.nextId.invalid).optional(),
    nextobjectid: int(Messages.nextId.invalid).optional(),
    tilesets: z.array(LayoutTilesetSchema, {
        error: Messages.tilesets.invalid,
    }),
    layers: z.array(
        z.discriminatedUnion("type", [
            LayoutTileLayerSchema,
            LayoutObjectGroupSchema,
        ]),
        { error: Messages.layers.invalid }
    ),
});

export type LayoutTileset = z.infer<typeof LayoutTilesetSchema>;
export type LayoutTileLayer = z.infer<typeof LayoutTileLayerSchema>;
export type LayoutObject = z.infer<typeof LayoutObjectSchema>;
export type LayoutObjectGroup = z.infer<typeof LayoutObjectGroupSchema>;
export type MapLayout = z.infer<typeof MapLayoutSchema>;
