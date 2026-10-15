import { db, assetsTable, eq } from "@standin/database";
import {
    AssetImageInUseError,
    LibraryValidationError,
    VariantSizeMismatchIssue,
} from "@standin/contracts";
import type { LibraryAsset, LibraryIssue } from "@standin/contracts";
import type { UploadedImage } from "../types";
import { softDeleteFile } from "../library/utils/softDeleteFile";
import { findScopedAsset, toLibraryAssets } from "../utils/loadRows";
import { readUploadedPng } from "../utils/readUploadedPng";
import { findAssetIdsInUse } from "../utils/usage";
import { withStoredFile } from "../utils/withStoredFile";

/**
 * Swaps the PNG of one row that no map uses. The new PNG keeps the frame size
 * and, for an animated asset, the frame count (so the width stays the same).
 * A new `files` row is created and the old one is soft deleted, the object
 * stays in storage.
 */
export const replaceLibraryAssetImage = async (
    assetId: string,
    organizationId: string | null,
    image: UploadedImage | undefined
): Promise<LibraryAsset> => {
    const asset = await findScopedAsset(assetId, organizationId);
    if ((await findAssetIdsInUse([assetId])).has(assetId)) {
        throw new AssetImageInUseError();
    }

    const { size, issues } = readUploadedPng(image?.buffer);
    const errors: LibraryIssue[] = [...issues];
    const frameCount = asset.animation?.frameCount ?? 1;
    if (
        size &&
        (size.width !== asset.spriteW * frameCount ||
            size.height !== asset.spriteH)
    ) {
        errors.push(new VariantSizeMismatchIssue());
    }
    if (errors.length > 0 || !image) throw new LibraryValidationError(errors);

    await withStoredFile(image, async (tx, fileId) => {
        await tx
            .update(assetsTable)
            .set({ fileId })
            .where(eq(assetsTable.id, assetId));
        await softDeleteFile(asset.fileId, tx);
    });

    const [updated] = await toLibraryAssets([
        await findScopedAsset(assetId, organizationId, db),
    ]);
    return updated!;
};
