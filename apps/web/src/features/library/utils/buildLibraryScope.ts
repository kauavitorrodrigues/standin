import type { LibraryPaths, LibraryScope } from "../types/LibraryScope";

const ADMIN_PATHS: LibraryPaths = {
    assets: "/admin/assets",
    newAsset: "/admin/assets/new",
    tilesets: "/admin/tilesets",
    newTileset: "/admin/tilesets/new",
    tileset: "/admin/tilesets/$tilesetId",
    areas: "/admin/areas",
    newArea: "/admin/areas/new",
    editArea: "/admin/areas/$areaId/edit",
};

const ORGANIZATION_PATHS: LibraryPaths = {
    assets: "/library/assets",
    newAsset: "/library/assets/new",
    tilesets: "/library/tilesets",
    newTileset: "/library/tilesets/new",
    tileset: "/library/tilesets/$tilesetId",
    areas: "/library/areas",
    newArea: "/library/areas/new",
    editArea: "/library/areas/$areaId/edit",
};

export const GLOBAL_LIBRARY_SCOPE: LibraryScope = {
    key: "global",
    apiBase: "/library",
    paths: ADMIN_PATHS,
};

export const buildOrganizationLibraryScope = (
    organizationId: string
): LibraryScope => ({
    key: organizationId,
    apiBase: `/organizations/${organizationId}/library`,
    paths: ORGANIZATION_PATHS,
});
