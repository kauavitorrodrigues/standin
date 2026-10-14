// Where the library screens live and which API they talk to. The admin works
// on the global library and the owner of an organization on its own, with the
// same screens over different routes and requests.
export type LibraryPaths = {
    assets: "/admin/assets" | "/library/assets";
    newAsset: "/admin/assets/new" | "/library/assets/new";
    tilesets: "/admin/tilesets" | "/library/tilesets";
    newTileset: "/admin/tilesets/new" | "/library/tilesets/new";
    tileset: "/admin/tilesets/$tilesetId" | "/library/tilesets/$tilesetId";
    areas: "/admin/areas" | "/library/areas";
    newArea: "/admin/areas/new" | "/library/areas/new";
    editArea: "/admin/areas/$areaId/edit" | "/library/areas/$areaId/edit";
};

export type LibraryScope = {
    // Part of every query key, so the two libraries never share a cache.
    key: string;
    // Prefix of the library API.
    apiBase: string;
    paths: LibraryPaths;
};
