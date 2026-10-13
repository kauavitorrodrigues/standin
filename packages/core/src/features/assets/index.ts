import { createLibraryAsset } from "./assets/createAsset";
import { createLibraryVariant } from "./assets/createVariant";
import { replaceLibraryAssetImage } from "./assets/replaceAssetImage";
import { deleteLibraryAsset } from "./assets/deleteAsset";
import { setLibraryAssetParts } from "./assets/setAssetParts";
import { updateLibraryAsset } from "./assets/updateAsset";
import { updateLibraryColor } from "./assets/updateColor";
import { getLibraryFamily } from "./getFamily";
import { listLibraryFamilies } from "./listFamilies";
import { listLibraryFamilyFacets } from "./listFamilyFacets";
import { getLibraryOverview } from "./overview";
import { seedLibrary } from "./seed/seedLibrary";
import { createLibraryTileset } from "./tilesets/createTileset";
import { getLibraryTileset } from "./tilesets/getTileset";
import { listLibraryTilesets } from "./tilesets/listTilesets";
import { renameLibraryTileset } from "./tilesets/renameTileset";
import { replaceLibraryTileMeta } from "./tilesets/replaceTileMeta";
import { replaceLibraryTilesetGrid } from "./tilesets/replaceTilesetGrid";
import { deleteLibraryTileset } from "./tilesets/deleteTileset";

export const AssetService = {
    createTileset: createLibraryTileset,
    listTilesets: listLibraryTilesets,
    getTileset: getLibraryTileset,
    renameTileset: renameLibraryTileset,
    replaceTileMeta: replaceLibraryTileMeta,
    replaceTilesetGrid: replaceLibraryTilesetGrid,
    deleteTileset: deleteLibraryTileset,
    createAsset: createLibraryAsset,
    createVariant: createLibraryVariant,
    listFamilies: listLibraryFamilies,
    listFamilyFacets: listLibraryFamilyFacets,
    getOverview: getLibraryOverview,
    getFamily: getLibraryFamily,
    updateAsset: updateLibraryAsset,
    updateColor: updateLibraryColor,
    replaceAssetImage: replaceLibraryAssetImage,
    deleteAsset: deleteLibraryAsset,
    setParts: setLibraryAssetParts,
    seed: seedLibrary,
};

export {
    DEFAULT_LIBRARY_SEED,
    buildColorSprite,
    buildColorTileset,
    encodePng,
} from "./library";
export type { UpdatedLibraryAssets } from "./assets/updateAsset";
export type { LibraryContext, UploadedImage } from "./types";
export type { LibrarySeed, LibrarySeedResult } from "./seed/types";
