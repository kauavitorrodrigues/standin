import type Phaser from "phaser";
import {
    MapObjectPropertiesSchema,
    normalizeMapObjectProperties,
    MAP_OBJECT_ACTIONS,
    type MapObjectAction,
    type MapObjectPropertiesSchemaType,
} from "@standin/contracts";
import {
    CENTER_POSITION_DIVISOR,
    MAP_LAYER_ORIGIN,
    OBJECT_ANCHOR_KINDS,
    OBJECT_ANCHOR_VERTICAL_SIGNS,
    type ObjectAnchorKind,
} from "@/features/game/consts/map-geometry";
import {
    ASSET_KEY_PREFIXES,
    ASSET_KEY_SEPARATOR,
} from "@/features/game/consts/asset-key-prefixes";
import { MAP_OBJECT_MARKER_COLORS } from "@/features/game/consts/object-marker-styles";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import type { MapScene } from "@/features/game/scenes/MapScene";

export type ResolvedObjectBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ResolvedObjectCenter = ResolvedObjectBounds & {
    centerX: number;
    centerY: number;
};

export const resolveObjectBounds = (
    object: Phaser.Types.Tilemaps.TiledObject,
    tilemap: Phaser.Tilemaps.Tilemap
): ResolvedObjectBounds => ({
    x: object.x ?? MAP_LAYER_ORIGIN.X,
    y: object.y ?? MAP_LAYER_ORIGIN.Y,
    width: object.width || tilemap.tileWidth,
    height: object.height || tilemap.tileHeight,
});

export const resolveAnchorKind = (
    object: Phaser.Types.Tilemaps.TiledObject
): ObjectAnchorKind =>
    object.gid === undefined
        ? OBJECT_ANCHOR_KINDS.TOP_LEFT
        : OBJECT_ANCHOR_KINDS.BOTTOM_LEFT;

const resolveVerticalCenterSign = (anchorKind: ObjectAnchorKind): number => {
    switch (anchorKind) {
    case OBJECT_ANCHOR_KINDS.TOP_LEFT:
        return OBJECT_ANCHOR_VERTICAL_SIGNS[OBJECT_ANCHOR_KINDS.TOP_LEFT];
    case OBJECT_ANCHOR_KINDS.BOTTOM_LEFT:
        return OBJECT_ANCHOR_VERTICAL_SIGNS[OBJECT_ANCHOR_KINDS.BOTTOM_LEFT];
    }
};

export const resolveObjectCenter = (
    object: Phaser.Types.Tilemaps.TiledObject,
    tilemap: Phaser.Tilemaps.Tilemap
): ResolvedObjectCenter => {
    const bounds = resolveObjectBounds(object, tilemap);
    const verticalSign = resolveVerticalCenterSign(resolveAnchorKind(object));

    return {
        ...bounds,
        centerX: bounds.x + bounds.width / CENTER_POSITION_DIVISOR,
        centerY:
            bounds.y +
            (bounds.height / CENTER_POSITION_DIVISOR) * verticalSign,
    };
};

export const resolveDefaultSpawnPoint = (
    tilemap: Phaser.Tilemaps.Tilemap
): { x: number; y: number } => ({
    x: tilemap.widthInPixels / CENTER_POSITION_DIVISOR,
    y: tilemap.heightInPixels / CENTER_POSITION_DIVISOR,
});

export const resolveMapObjectProperties = (
    object: Phaser.Types.Tilemaps.TiledObject,
    bounds: ResolvedObjectBounds
): MapObjectPropertiesSchemaType | null => {
    const normalized = normalizeMapObjectProperties({
        id: object.id,
        name: object.name,
        type: object.type,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        properties: object.properties,
    });

    const parsed = MapObjectPropertiesSchema.safeParse(normalized);
    return parsed.success ? parsed.data : null;
};

export type ResolvedObjectRecord = {
    name: string;
    properties: MapObjectPropertiesSchemaType;
    center: ResolvedObjectCenter;
};

export const resolveObjectRecords = (
    tilemap: Phaser.Tilemaps.Tilemap
): ResolvedObjectRecord[] =>
    tilemap.objects.flatMap((layer) =>
        layer.objects
            .map((object) => {
                const bounds = resolveObjectBounds(object, tilemap);
                const properties = resolveMapObjectProperties(object, bounds);
                if (!properties) return null;

                return {
                    name: object.name,
                    properties,
                    center: resolveObjectCenter(object, tilemap),
                };
            })
            .filter(
                (record): record is ResolvedObjectRecord => record !== null
            )
    );

export const getMapObjectMarkerColor = (action: MapObjectAction): number => {
    switch (action) {
    case MAP_OBJECT_ACTIONS.SIT:
        return MAP_OBJECT_MARKER_COLORS.SIT;
    case MAP_OBJECT_ACTIONS.TELEPORT:
        return MAP_OBJECT_MARKER_COLORS.TELEPORT;
    }
};

export const buildMapAssetKey = (mapId: string): string =>
    [ASSET_KEY_PREFIXES.MAP_JSON, mapId].join(ASSET_KEY_SEPARATOR);

export const buildTilesetAssetKey = (
    mapId: string,
    tilesetName: string
): string =>
    [ASSET_KEY_PREFIXES.TILESET_IMAGE, mapId, tilesetName].join(
        ASSET_KEY_SEPARATOR
    );

export const getMapScene = (game: Phaser.Game): MapScene | null =>
    game.scene.getScene<MapScene>(GAME_SCENE_KEYS.MAP) ?? null;
