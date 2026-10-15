import { db, assetsTable } from "@standin/database";
import { ASSET_PLACEMENTS, LibraryValidationError } from "@standin/contracts";
import type { CreateAssetData, LibraryAsset } from "@standin/contracts";
import type { LibraryContext, UploadedImage } from "../types";
import { resolveAssetKey } from "../utils/keys";
import { findScopedAsset, toLibraryAssets } from "../utils/loadRows";
import { planAsset } from "../utils/planAsset";
import { readUploadedPng } from "../utils/readUploadedPng";
import { assertGlobalScope } from "../utils/scope";
import { withStoredFile } from "../utils/withStoredFile";

/**
 * Creates a base asset from one PNG and its fields. The frame size comes from
 * the PNG (the whole image, or one frame of the strip for an animated asset).
 * Every problem is collected before anything is written.
 */
export const createLibraryAsset = async (
    image: UploadedImage | undefined,
    data: CreateAssetData,
    { organizationId, createdBy }: LibraryContext
): Promise<LibraryAsset> => {
    assertGlobalScope(data.organizationId);

    const { size, issues } = readUploadedPng(image?.buffer);
    const plan = planAsset(data, size);
    const errors = [...issues, ...plan.errors];
    if (errors.length > 0 || !image || !plan.values) {
        throw new LibraryValidationError(errors);
    }
    const { category, frame, footprint } = plan.values;
    const action = data.action ?? null;
    const actionParams = data.actionParams ?? null;

    const key = await resolveAssetKey(data.key, data.name, organizationId);
    const id = await withStoredFile(image, async (tx, fileId) => {
        const [created] = await tx
            .insert(assetsTable)
            .values({
                organizationId,
                baseAssetId: null,
                fileId,
                createdBy,
                key,
                name: data.name,
                type: data.type,
                category,
                rotation: data.rotation ?? null,
                colorKey: data.color?.key ?? null,
                colorHex: data.color?.hex ?? null,
                spriteW: frame.w,
                spriteH: frame.h,
                footprintW: footprint.w,
                footprintH: footprint.h,
                footprintOffsetX: footprint.offsetX,
                placement: data.placement ?? ASSET_PLACEMENTS.GROUND,
                surfaceHeightPx: data.surfaceHeightPx ?? 0,
                solid: data.solid ?? false,
                action,
                actionParams,
                promptText: data.promptText ?? null,
                animation: data.animation ?? null,
            })
            .returning({ id: assetsTable.id });
        return created!.id;
    });

    const [asset] = await toLibraryAssets([
        await findScopedAsset(id, organizationId, db),
    ]);
    return asset!;
};
