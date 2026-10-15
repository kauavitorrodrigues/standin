import { db, assetsTable } from "@standin/database";
import {
    LibraryValidationError,
    VariantBaseInvalidIssue,
} from "@standin/contracts";
import type { CreateVariantData, LibraryAsset } from "@standin/contracts";
import type { LibraryContext, UploadedImage } from "../types";
import { resolveAssetKey } from "../utils/keys";
import {
    findScopedAsset,
    loadFamilyRows,
    toLibraryAssets,
} from "../utils/loadRows";
import { planVariant } from "../utils/planVariant";
import { readUploadedPng } from "../utils/readUploadedPng";
import { withStoredFile } from "../utils/withStoredFile";

const EMPTY = "";

/**
 * Creates one variation (a color, a rotation, or both) of a base asset. A new
 * color on a rotation that already exists copies the footprint and the action
 * params of the sibling and refuses overrides. A new rotation copies only the
 * family fields from the base and needs its own footprint (and action params,
 * when the base has an action). The frame size and the animation follow the
 * family.
 */
export const createLibraryVariant = async (
    baseId: string,
    image: UploadedImage | undefined,
    data: CreateVariantData,
    { organizationId, createdBy }: LibraryContext
): Promise<LibraryAsset> => {
    const base = await findScopedAsset(baseId, organizationId);
    if (base.baseAssetId !== null) {
        throw new LibraryValidationError([new VariantBaseInvalidIssue()]);
    }

    const family = await loadFamilyRows(base.id);
    const { size, issues } = readUploadedPng(image?.buffer);
    const plan = planVariant(base, family, data, size);
    const errors = [...issues, ...plan.errors];
    if (errors.length > 0 || !image || !plan.values) {
        throw new LibraryValidationError(errors);
    }
    const { rotation, color, frame, footprint, actionParams } = plan.values;

    const keyHint = [base.key, color?.key, data.rotation ?? EMPTY]
        .filter(Boolean)
        .join(" ");
    const key = await resolveAssetKey(data.key, keyHint, organizationId);

    const id = await withStoredFile(image, async (tx, fileId) => {
        const [created] = await tx
            .insert(assetsTable)
            .values({
                organizationId: base.organizationId,
                baseAssetId: base.id,
                fileId,
                createdBy,
                key,
                name: base.name,
                type: base.type,
                category: base.category,
                rotation,
                colorKey: color?.key ?? null,
                colorHex: color?.hex ?? null,
                spriteW: frame.w,
                spriteH: frame.h,
                footprintW: footprint.w,
                footprintH: footprint.h,
                footprintOffsetX: footprint.offsetX,
                placement: base.placement,
                surfaceHeightPx: base.surfaceHeightPx,
                solid: base.solid,
                action: base.action,
                actionParams,
                promptText: base.promptText,
                animation: base.animation,
            })
            .returning({ id: assetsTable.id });
        return created!.id;
    });

    const [asset] = await toLibraryAssets([
        await findScopedAsset(id, organizationId, db),
    ]);
    return asset!;
};
