import { getLibraryOverview } from "./overview";
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
