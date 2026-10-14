import type { LibraryPalette } from "../../../../assets/types/library";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import type { Stamp } from "../../types/stamp";

/** One issue for the first tileset and one for the first asset of the stamp that the library does not list. */
export const findUnavailableStampItems = (
    stamp: Stamp,
    library: LibraryPalette
): LayoutIssue[] => {
    const issues: LayoutIssue[] = [];

    const tilesetIds = new Set(library.tilesets.map(({ id }) => id));
    const tileset = stamp.palette.find(
        ({ tilesetId }) => !tilesetIds.has(tilesetId)
    );
    if (tileset) {
        issues.push(
            createIssue(
                Code.STAMP_TILESET_UNAVAILABLE,
                `palette.${tileset.tilesetId}`,
                Messages.stampTilesetUnavailable
            )
        );
    }

    const assetIds = new Set(library.assets.map(({ id }) => id));
    const asset = stamp.objects.find(({ assetId }) => !assetIds.has(assetId));
    if (asset) {
        issues.push(
            createIssue(
                Code.STAMP_ASSET_UNAVAILABLE,
                `objects.${asset.assetId}`,
                Messages.stampAssetUnavailable
            )
        );
    }

    return issues;
};
