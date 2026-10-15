import { DELETE_MODES, type DeleteMode } from "../consts/deleteModes";

// The API refuses to delete a base asset that still has variations. Deleting
// it asks for the whole family. A variation always goes alone.
export const getDeleteMode = (
    asset: { baseAssetId: string | null; id: string },
    family: { variants: { id: string }[] }
): DeleteMode => {
    const isBase = asset.baseAssetId === null;
    const hasOthers = family.variants.some(({ id }) => id !== asset.id);
    return isBase && hasOthers ? DELETE_MODES.FAMILY : DELETE_MODES.ALONE;
};
