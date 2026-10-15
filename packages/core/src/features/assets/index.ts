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

export const AssetService = {
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
};

export { buildColorSprite, encodePng } from "./library";
export type { UpdatedLibraryAssets } from "./assets/updateAsset";
export type { LibraryContext, UploadedImage } from "./types";
