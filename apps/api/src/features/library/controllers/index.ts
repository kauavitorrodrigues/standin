import { getLibraryOverview } from "./overview";
import { getLibraryPalette } from "./palette";
import { createLibraryTileset } from "./tilesets/create";
import { listLibraryTilesets } from "./tilesets/list";
import { getLibraryTileset } from "./tilesets/details";
import { updateLibraryTileset } from "./tilesets/update";
import { replaceLibraryTilesetGrid } from "./tilesets/replaceGrid";
import { replaceLibraryTileMeta } from "./tilesets/replaceTileMeta";
import { deleteLibraryTileset } from "./tilesets/delete";
import { createLibraryAsset } from "./assets/create";
import { createLibraryVariant } from "./assets/createVariant";
import { listLibraryFamilies } from "./assets/list";
import { listLibraryFamilyFacets } from "./assets/facets";
import { getLibraryFamily } from "./assets/details";
import { updateLibraryAsset } from "./assets/update";
import { updateLibraryColor } from "./assets/updateColor";
import { replaceLibraryAssetImage } from "./assets/replaceImage";
import { deleteLibraryAsset } from "./assets/delete";
import { setLibraryAssetParts } from "./assets/setParts";

export const LibraryController = {
    overview: getLibraryOverview,
    palette: getLibraryPalette,
    tilesets: {
        create: createLibraryTileset,
        list: listLibraryTilesets,
        details: getLibraryTileset,
        update: updateLibraryTileset,
        replaceTileMeta: replaceLibraryTileMeta,
        replaceGrid: replaceLibraryTilesetGrid,
        delete: deleteLibraryTileset,
    },
    assets: {
        create: createLibraryAsset,
        createVariant: createLibraryVariant,
        list: listLibraryFamilies,
        facets: listLibraryFamilyFacets,
        details: getLibraryFamily,
        update: updateLibraryAsset,
        updateColor: updateLibraryColor,
        replaceImage: replaceLibraryAssetImage,
        delete: deleteLibraryAsset,
        setParts: setLibraryAssetParts,
    },
};
