import { ASSET_TYPES } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { fail } from "../internal/fail";
import { resolveTempIds } from "../internal/tempIds";
import { createLibraryIndex } from "../library/createLibraryIndex";
import type {
    AuthoringIssue,
    BuildOptions,
    BuildResult,
    DeskSpot,
    PlaceDeskParams,
} from "../types";
import { resolveDeskAsset } from "./desk/resolveDeskAssets";

const buildSpotOp = (
    spot: DeskSpot,
    assetId: string,
    tempId: string,
    parentId?: string
): EditorOp => ({
    type: "place_asset",
    tempId,
    assetId,
    tileX: spot.tileX,
    tileY: spot.tileY,
    ...(spot.offsetX === undefined ? {} : { offsetX: spot.offsetX }),
    ...(spot.offsetY === undefined ? {} : { offsetY: spot.offsetY }),
    ...(parentId ? { parentId } : {}),
});

/**
 * A desk with what stands on it and around it. The desk is an ordinary
 * placed object of type DESK; whoever claims it is decided on the server,
 * never in the ops.
 */
export const placeDesk = (
    model: EditorModel,
    { desk, tileX, tileY, items = [], chairs = [] }: PlaceDeskParams,
    options?: BuildOptions
): BuildResult => {
    const index = createLibraryIndex(model.library);
    const newTempId = resolveTempIds(model, options);
    const issues: AuthoringIssue[] = [];

    const deskAsset = resolveDeskAsset(index, issues, desk, ASSET_TYPES.DESK);
    const itemAssets = items.map((spot) =>
        resolveDeskAsset(index, issues, spot.asset, null)
    );
    const chairAssets = chairs.map((spot) =>
        resolveDeskAsset(index, issues, spot.asset, ASSET_TYPES.CHAIR)
    );
    if (issues.length > 0 || !deskAsset) return fail(...issues);

    const deskId = newTempId();
    const ops: EditorOp[] = [
        buildSpotOp({ asset: desk, tileX, tileY }, deskAsset.id, deskId),
    ];
    items.forEach((spot, i) =>
        ops.push(buildSpotOp(spot, itemAssets[i]!.id, newTempId(), deskId))
    );
    chairs.forEach((spot, i) =>
        ops.push(buildSpotOp(spot, chairAssets[i]!.id, newTempId()))
    );

    return checkOps(model, ops);
};
