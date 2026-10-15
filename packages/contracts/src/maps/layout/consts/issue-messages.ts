import {
    MAX_MAP_TILES,
    MAX_OBJECTS_PER_MAP,
    MAX_TILESETS_PER_MAP,
    MAX_ZONES_PER_MAP,
    MIN_MAP_TILES,
    TILE_SIZE,
} from "../../consts/constants";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "../../editor/consts/limits";
import { AREA_NAME_MAX } from "../../../areas/consts/limits";
import { SPAWN_MIN_DISTANCE_TILES } from "./thresholds";

// Every message a layout issue can carry. Callers pick one by name and never
// write a message inline, so the wording lives in one place.
export const LAYOUT_ISSUE_MESSAGES = {
    notOrthogonal: "The map must be orthogonal.",
    infinite: "The map cannot be infinite.",
    tileSizeMismatch: `The map tile must be ${TILE_SIZE} x ${TILE_SIZE} pixels.`,
    tooLargeGlobal: `The map cannot exceed ${MAX_MAP_TILES} x ${MAX_MAP_TILES} tiles.`,
    tooSmall: `The map must be at least ${MIN_MAP_TILES.width} x ${MIN_MAP_TILES.height} tiles.`,
    tierDimensionExceeded: (tier: string, width: number, height: number) =>
        `The map exceeds the maximum size of tier ${tier} (${width} x ${height}).`,
    layoutInvalid: "The map layout is invalid.",
    staleLayout: "The map was changed by someone else. Reload to continue.",
    tierDisabled: "This map size is not available yet.",
    missingGroundLayer: 'The map must have a "ground" layer.',
    layerDimensionMismatch: (layer: string) =>
        `The "${layer}" layer has different dimensions than the map.`,
    layerDataLength: (layer: string) =>
        `The data of the "${layer}" layer does not match the map width times height.`,
    gidOutOfRange: (layer: string) =>
        `The "${layer}" layer uses a tile that does not exist in the map tilesets.`,
    tilesetNotInLibrary: "The map tileset does not exist in the asset library.",
    tooManyTilesets: `The map uses more than ${MAX_TILESETS_PER_MAP} tilesets.`,
    tooManyObjects: `The map cannot have more than ${MAX_OBJECTS_PER_MAP} objects.`,
    zoneKindInvalid: "The zone kind is invalid.",
    zoneLabelRequired: "The zone needs a name.",
    zoneKeyRequired: "The private area needs a key.",
    zoneKeyDuplicated: "A zone with this key already exists on the map.",
    zonePolygonInvalid: "The zone polygon needs at least 3 points.",
    zoneRotated: "The zone cannot be rotated.",
    doorOutsidePrivateZone:
        "A door must be placed on the border of a private area.",
    doorBetweenRooms:
        "A door cannot be on the border of two private areas at once.",
    tooManyZones: `The map cannot have more than ${MAX_ZONES_PER_MAP} zones.`,
    spawnMissing: "The map needs at least one spawn point.",
    spawnTooClose: `There are spawn points less than ${SPAWN_MIN_DISTANCE_TILES} tiles apart.`,
    cellOutOfBounds: "The cell is outside the map.",
    tileNotInLibrary: "The tile does not exist in the asset library.",
    categoryLayerMismatch: "The tile category does not match the chosen layer.",
    layoutTooLarge: "The map layout exceeds the maximum allowed size.",
    blankDefaultFloorMissing:
        "The library has no default floor tile for the blank map.",
    blankDefaultDuplicated:
        "There can only be one default floor tile and one default wall tile.",
    thumbnailAspectMismatch:
        "The thumbnail aspect ratio differs from the map aspect ratio by more than 2%.",
    cellOccupiedByObject:
        "A wall tile cannot be painted on a cell covered by a ground object.",
    cellBlockedByWall:
        "A ground object cannot be placed over a cell with a solid wall tile.",
    wallHasMountedObject:
        "A wall tile cannot be erased or replaced while a wall object is mounted on it.",
    notOnSurface:
        "A surface object must be placed on top of an object that accepts items.",
    notOnWall: "A wall object must be placed on a cell with a wall tile.",
    footprintOverlap:
        "The footprint overlaps another object of the same occupation type.",
    replaceIncompatible:
        "The replacement asset is not compatible with the current object.",
    opTooLarge: "The operation touches more cells than the allowed limit.",
    opNotSupported: "This operation type is not supported yet.",
    objectNotFound: "The object does not exist on the map.",
    objectIdTaken: "Another object on the map already uses this id.",
    assetNotInLibrary: "The asset does not exist in the map library.",
    deskClaimed:
        "The desk is claimed by a user. Release it to remove the object.",
    deskClaimedByOther:
        "This desk belongs to someone else, and so does everything on it.",
    deskReleaseRequired:
        "Removing your own desk requires releasing it, and the items on it go too.",
    outOfScope: "This operation is not allowed in the current edit scope.",
    stampInvalid: "The area stamp is invalid.",
    stampTooSmall: `The area must be at least ${STAMP_MIN_SIZE} x ${STAMP_MIN_SIZE} tiles.`,
    stampTooLarge: `The area cannot exceed ${STAMP_MAX_WIDTH} x ${STAMP_MAX_HEIGHT} tiles.`,
    stampEmpty: "The area has no tiles and no objects.",
    stampTooManyObjects: `The area cannot hold more than ${STAMP_MAX_OBJECTS} objects.`,
    stampObjectCrossesEdge:
        "An object is only partly inside the area. Move it fully inside.",
    stampParentOutside:
        "An object that sits on top of another needs that object inside the area.",
    stampOutOfBounds: "The area does not fit inside the map here.",
    stampAreaNotEmpty:
        "There are objects in the way. Remove them before placing the area.",
    stampCoversSpawn: "The area cannot cover the spawn point.",
    stampOverlapsArea: "The area cannot overlap another area.",
    stampTilesetUnavailable:
        "The area uses a tileset that is not available for this map.",
    stampAssetUnavailable:
        "The area uses an asset that is not available for this map.",
    stampDoorNeedsRoom:
        "An area with a door must be a room. Make the area zone a room.",
    stampDoorOutsideRoom:
        "A door of the area must stand on the border of the area.",
    areaNameInvalid: `The area name must have 1 to ${AREA_NAME_MAX} characters.`,
    invalidPng: (key: string) => `The image "${key}" is not a valid PNG.`,
    gridMismatch: (key: string) =>
        `The grid of tileset "${key}" does not match the image size (${TILE_SIZE} px tiles).`,
    tileOutsideTileset: (index: string, key: string) =>
        `Tile ${index} of image "${key}" is outside the tileset.`,
} as const;
