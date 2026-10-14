export const MapErrorMessages = {
    id: {
        invalid: "The map ID is invalid.",
    },
    name: {
        required: "The map name is required.",
        max: "The map name must be at most 255 characters.",
        invalid: "The map name is invalid.",
    },
    width: {
        required: "The map width is required.",
        positive: "The map width must be greater than zero.",
        invalid: "The map width is invalid.",
    },
    height: {
        required: "The map height is required.",
        positive: "The map height must be greater than zero.",
        invalid: "The map height is invalid.",
    },
    tileSize: {
        required: "The map tile size is required.",
        positive: "The map tile size must be greater than zero.",
        invalid: "The map tile size is invalid.",
    },
    sizeTier: {
        invalid: "The map size is invalid.",
        disabled: "This map size is not available yet.",
    },
    layoutVersion: {
        invalid: "The map layout version is invalid.",
    },
    layout: {
        invalid: "The map layout is invalid.",
    },
    tilesets: {
        invalid: "The map tilesets are invalid.",
    },
};

export const MapLayoutErrorMessages = {
    orientation: {
        invalid: "The map must be orthogonal.",
    },
    infinite: {
        invalid: "The map cannot be infinite.",
    },
    tileSize: {
        invalid: "The map tile size must be 32 pixels.",
    },
    width: {
        invalid: "The layout width is invalid.",
    },
    height: {
        invalid: "The layout height is invalid.",
    },
    backgroundColor: {
        invalid: "The layout background color is invalid.",
    },
    tilesets: {
        invalid: "The layout tilesets are invalid.",
    },
    layers: {
        invalid: "The layout layers are invalid.",
    },
    renderOrder: {
        invalid: "The layout render order is invalid.",
    },
    nextId: {
        invalid: "The layout next ID is invalid.",
    },
    tileset: {
        name: {
            invalid: "The layout tileset name is invalid.",
        },
        firstGid: {
            invalid: "The layout tileset first GID is invalid.",
        },
    },
    object: {
        id: { invalid: "The layer object ID is invalid." },
        name: { invalid: "The layer object name is invalid." },
        type: { invalid: "The layer object type is invalid." },
        x: { invalid: "The layer object X position is invalid." },
        y: { invalid: "The layer object Y position is invalid." },
        width: { invalid: "The layer object width is invalid." },
        height: { invalid: "The layer object height is invalid." },
        rotation: { invalid: "The layer object rotation is invalid." },
        visible: { invalid: "The layer object visibility is invalid." },
        polygon: { invalid: "The layer object polygon is invalid." },
        point: { invalid: "The polygon points must be numbers." },
        properties: {
            invalid: "The layer object properties are invalid.",
        },
        objects: { invalid: "The layer objects are invalid." },
    },
    layer: {
        id: { invalid: "The layout layer ID is invalid." },
        visible: { invalid: "The layout layer visibility is invalid." },
        opacity: { invalid: "The layout layer opacity is invalid." },
        type: {
            invalid: "The layout layer type is invalid.",
        },
        name: {
            invalid: "The layout layer name is invalid.",
        },
        width: {
            invalid: "The layout layer width is invalid.",
        },
        height: {
            invalid: "The layout layer height is invalid.",
        },
        data: {
            invalid: "The layout layer data is invalid.",
            tile: "The layout layer tiles must be integers.",
        },
    },
};

export const MapObjectErrorMessages = {
    missingAction: (identifier: string) =>
        `Object "${identifier}" is interactable but "action" is missing or invalid.`,
    missingSitTarget: (identifier: string) =>
        `Object "${identifier}" has action="sit" but is missing seatX/seatY.`,
    missingTeleportTarget: (identifier: string) =>
        `Object "${identifier}" has action="teleport" but is missing targetX/targetY.`,
};

export const TiledObjectPropertyErrorMessages = {
    name: {
        required: "The property name is required.",
        invalid: "The property name is invalid.",
    },
    type: {
        required: "The property type is required.",
        invalid: "The property type is invalid.",
    },
};

export const TiledObjectErrorMessages = {
    id: {
        required: "The object ID is required.",
        invalid: "The object ID is invalid.",
    },
    name: {
        required: "The object name is required.",
        invalid: "The object name is invalid.",
    },
    type: {
        required: "The object type is required.",
        invalid: "The object type is invalid.",
    },
    gid: {
        invalid: "The object GID is invalid.",
    },
    x: {
        required: "The object X position is required.",
        invalid: "The object X position is invalid.",
    },
    y: {
        required: "The object Y position is required.",
        invalid: "The object Y position is invalid.",
    },
    width: {
        required: "The object width is required.",
        invalid: "The object width is invalid.",
    },
    height: {
        required: "The object height is required.",
        invalid: "The object height is invalid.",
    },
    properties: {
        invalid: "The object properties are invalid.",
    },
};

export const MapObjectPropertiesErrorMessages = {
    solid: {
        invalid: 'The object "solid" field is invalid.',
    },
    interactable: {
        invalid: 'The object "interactable" field is invalid.',
    },
    action: {
        invalid: "The object action is invalid.",
    },
    seatX: {
        required: 'seatX is required for action="sit".',
        invalid: "seatX is invalid.",
    },
    seatY: {
        required: 'seatY is required for action="sit".',
        invalid: "seatY is invalid.",
    },
    targetX: {
        required: 'targetX is required for action="teleport".',
        invalid: "targetX is invalid.",
    },
    targetY: {
        required: 'targetY is required for action="teleport".',
        invalid: "targetY is invalid.",
    },
};

export const TiledLayerErrorMessages = {
    type: {
        invalid: "The layer type is invalid.",
    },
    name: {
        required: "The layer name is required.",
        invalid: "The layer name is invalid.",
    },
    objects: {
        invalid: "The layer objects are invalid.",
    },
};

export const TiledMapJsonErrorMessages = {
    layers: {
        invalid: "The map layers are invalid.",
    },
    tilesets: {
        invalid: "The map tilesets are invalid.",
    },
    name: {
        required: "The tileset name is required.",
        invalid: "The tileset name is invalid.",
    },
};

export const LayoutOpErrorMessages = {
    baseVersion: { invalid: "The layout base version is invalid." },
    ops: {
        invalid: "The layout operations are invalid.",
        required: "Send at least one operation.",
    },
    op: { invalid: "The layout operation is invalid." },
    layer: { invalid: "The operation layer is invalid." },
    tilesetId: { invalid: "The tile tileset is invalid." },
    tileIndex: { invalid: "The tile index is invalid." },
    cells: { invalid: "The operation cells are invalid." },
    cell: { invalid: "Each cell must be a pair of integers." },
    zoneId: { invalid: "The zone ID is invalid." },
    color: { invalid: "The background color must be in #RRGGBB format." },
    zone: {
        invalid: "The zone is invalid.",
        kind: { invalid: "The zone kind is invalid." },
        position: { invalid: "The zone position is invalid." },
        size: { invalid: "The zone size is invalid." },
        rotation: { invalid: "The zone rotation is invalid." },
        polygon: { invalid: "The zone polygon is invalid." },
        label: { invalid: "The zone name is invalid." },
        key: { invalid: "The zone key is invalid." },
        target: { invalid: "The zone target is invalid." },
    },
};

export const MapRenderErrorMessages = {
    map: { invalid: "The map data is invalid." },
    layoutVersion: { invalid: "The layout version is invalid." },
    tilesets: { invalid: "The map tilesets are invalid." },
    assets: { invalid: "The map assets are invalid." },
    placed: { invalid: "The placed objects are invalid." },
    desks: { invalid: "The map desks are invalid." },
    access: { invalid: "The map permissions are invalid." },
    id: { invalid: "The placed object ID is invalid." },
    assetId: { invalid: "The placed asset ID is invalid." },
    tile: { invalid: "The object position on the map is invalid." },
    offset: { invalid: "The object offset on the map is invalid." },
    parentId: { invalid: "The parent object ID is invalid." },
    userId: { invalid: "The desk user ID is invalid." },
    canEdit: { invalid: "The edit permission is invalid." },
    ownDesk: { invalid: "The user's desk is invalid." },
    limits: { invalid: "The map object limits are invalid." },
    objectsUsed: { invalid: "The number of objects in use is invalid." },
    objectsMax: { invalid: "The maximum number of objects is invalid." },
    lock: { invalid: "The map lock is invalid." },
    locked: { invalid: "The locked flag is invalid." },
    lockBy: { invalid: "The lock holder is invalid." },
    lockSince: { invalid: "The lock start date is invalid." },
};

export const MapAssetErrorMessages = {
    assetId: { invalid: "Choose an asset to place." },
    tile: { invalid: "The object position must be an integer." },
    offset: {
        invalid: "The object offset must be an integer within one tile.",
    },
    parentId: { invalid: "The parent object ID is invalid." },
    changes: { required: "Provide at least one change." },
    userId: { invalid: "Choose the person who will receive the desk." },
    releaseDesk: { invalid: 'The "releaseDesk" field is invalid.' },
    swap: { invalid: 'The "swap" field is invalid.' },
};
