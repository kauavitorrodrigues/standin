import type { EditorModel } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { fail } from "../internal/fail";
import { resolveTempIds } from "../internal/tempIds";
import { createLibraryIndex } from "../library/createLibraryIndex";
import type { BuildOptions, BuildResult, PlaceObjectParams } from "../types";

/** Places one object of the library. */
export const placeObject = (
    model: EditorModel,
    { asset, tileX, tileY, offsetX, offsetY, parentId }: PlaceObjectParams,
    options?: BuildOptions
): BuildResult => {
    const resolved = createLibraryIndex(model.library).asset(asset);
    if (!resolved.ok) return fail(resolved.issue);

    return checkOps(model, [
        {
            type: "place_asset",
            tempId: resolveTempIds(model, options)(),
            assetId: resolved.value.id,
            tileX,
            tileY,
            ...(offsetX === undefined ? {} : { offsetX }),
            ...(offsetY === undefined ? {} : { offsetY }),
            ...(parentId === undefined ? {} : { parentId }),
        },
    ]);
};
