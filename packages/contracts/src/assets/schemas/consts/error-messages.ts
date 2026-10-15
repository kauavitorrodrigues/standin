export const TilesetErrorMessages = {
    id: { invalid: "The tileset id is invalid." },
    key: { invalid: "The tileset key is invalid." },
    name: { invalid: "The tileset name is invalid." },
    url: { invalid: "The tileset URL is invalid." },
    widthPx: { invalid: "The tileset width is invalid." },
    heightPx: { invalid: "The tileset height is invalid." },
    columns: { invalid: "The tileset column count is invalid." },
    tileCount: { invalid: "The tileset tile count is invalid." },
    margin: { invalid: "The tileset margin is invalid." },
    spacing: { invalid: "The tileset spacing is invalid." },
    tileMeta: { invalid: "The tile metadata of the tileset is invalid." },
    grid: { invalid: "The tileset margin and spacing are invalid." },
};

export const TileMetaErrorMessages = {
    meta: { invalid: "The tile metadata is invalid." },
    index: { invalid: "The tile index must be an integer." },
    category: { invalid: "The tile category is invalid." },
    solid: { invalid: 'The tile field "solid" is invalid.' },
    top: { invalid: "The top tile of the wall is invalid." },
    blankDefault: {
        invalid: 'The tile field "blankDefault" is invalid.',
    },
};

export const ActionParamsErrorMessages = {
    seats: {
        invalid: "The seats of the asset are invalid.",
        required: "The asset needs at least one seat.",
    },
    seat: {
        dx: { invalid: "The horizontal offset of the seat is invalid." },
        dy: { invalid: "The vertical offset of the seat is invalid." },
        facing: { invalid: "The facing of the seat is invalid." },
    },
    targetX: { invalid: "The target X position is invalid." },
    targetY: { invalid: "The target Y position is invalid." },
};

export const AssetErrorMessages = {
    id: { invalid: "The asset id is invalid." },
    baseAssetId: { invalid: "The base asset id is invalid." },
    key: { invalid: "The asset key is invalid." },
    name: { invalid: "The asset name is invalid." },
    type: { invalid: "The asset type is invalid." },
    category: { invalid: "The asset category is invalid." },
    rotation: { invalid: "The asset rotation is invalid." },
    colorKey: { invalid: "The color key of the asset is invalid." },
    colorHex: { invalid: "The color hex value of the asset is invalid." },
    colorFields: {
        inconsistent:
            "The color key and the color hex value must come together.",
    },
    url: { invalid: "The asset image URL is invalid." },
    sprite: { invalid: "The sprite frame size of the asset is invalid." },
    footprint: { invalid: "The footprint of the asset is invalid." },
    placement: { invalid: "The asset placement is invalid." },
    surfaceHeightPx: {
        invalid: "The surface height of the asset is invalid.",
    },
    solid: { invalid: 'The asset field "solid" is invalid.' },
    action: { invalid: "The asset action is invalid." },
    actionParams: {
        invalid: "The action parameters of the asset are invalid.",
    },
    promptText: { invalid: "The interaction text of the asset is invalid." },
    animation: { invalid: "The asset animation is invalid." },
    animationFrameCount: {
        invalid: "The animation needs a frame count of at least 2.",
    },
    animationFrameDuration: {
        invalid: "The animation frame duration is invalid.",
    },
    animationRepeat: { invalid: "The animation repeat is invalid." },
    tilesets: { invalid: "The library tilesets are invalid." },
    assets: { invalid: "The library assets are invalid." },
};

export const LibraryDataErrorMessages = {
    data: { invalid: "The data part is invalid." },
    key: { invalid: "The key is invalid." },
    name: { invalid: "The name is invalid." },
    organizationId: { invalid: "The organization id is invalid." },
    footprint: { invalid: "The footprint is invalid." },
    variant: { invalid: "The variant data is invalid." },
    update: {
        empty: "Provide at least one field to update.",
        invalid: "The asset data is invalid.",
    },
    parts: { invalid: "The bundle parts are invalid." },
    family: { invalid: "The family option must be true or false." },
};

export const LibraryFamilyQueryErrorMessages = {
    search: { invalid: "The search text is invalid." },
    type: { invalid: "The asset type filter is invalid." },
    category: { invalid: "The asset category filter is invalid." },
    placement: { invalid: "The placement filter is invalid." },
    inUse: { invalid: "The in use filter must be true or false." },
    sort: { invalid: "The sort option is invalid." },
    page: { invalid: "The page must be a positive integer." },
    pageSize: { invalid: "The page size is invalid." },
};

export const LibraryTilesetQueryErrorMessages = {
    search: { invalid: "The search text is invalid." },
    inUse: { invalid: "The in use filter must be true or false." },
    progress: { invalid: "The progress filter is invalid." },
};
