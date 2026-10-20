import {
    and,
    asc,
    avatarBasesTable,
    avatarCategoriesTable,
    avatarPartsTable,
    desc,
    db,
    eq,
    isNull,
    or,
    userAvatarBasesTable,
    userAvatarPartsTable,
} from "@standin/database";
import { AVATAR_BASE_KINDS, AVATAR_SLOT_TABS } from "@standin/contracts";
import type { AvatarEditor } from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";

const toUrl = (fileId: string | null) =>
    fileId === null ? null : buildFileUrl(fileId);

const slotPosition = (slot: (typeof AVATAR_SLOT_TABS)[number]) =>
    AVATAR_SLOT_TABS.indexOf(slot);

/**
 * What the editor needs to open, with no part list: the categories in the
 * order of the editor, the bases, and what the person uses now. The current
 * parts and the current base come even when deleted since, so the preview
 * stays faithful. The parts of a category come from `listCategoryParts`.
 */
export const getAvatarEditor = async (
    userId: string
): Promise<AvatarEditor> => {
    const [categories, [chosenBase], currentParts] = await Promise.all([
        db
            .select({
                slot: avatarCategoriesTable.slot,
                name: avatarCategoriesTable.name,
                previewFileId: avatarCategoriesTable.previewFileId,
            })
            .from(avatarCategoriesTable)
            .orderBy(
                asc(avatarCategoriesTable.sortOrder),
                asc(avatarCategoriesTable.slot)
            ),
        db
            .select({ baseId: userAvatarBasesTable.baseId })
            .from(userAvatarBasesTable)
            .where(eq(userAvatarBasesTable.userId, userId)),
        db
            .select({
                slot: userAvatarPartsTable.slot,
                partId: userAvatarPartsTable.partId,
                basePartId: avatarPartsTable.basePartId,
                fileId: avatarPartsTable.fileId,
            })
            .from(userAvatarPartsTable)
            .innerJoin(
                avatarPartsTable,
                eq(avatarPartsTable.id, userAvatarPartsTable.partId)
            )
            .where(eq(userAvatarPartsTable.userId, userId)),
    ]);

    const baseId = chosenBase?.baseId ?? null;
    const bases = await db
        .select({
            id: avatarBasesTable.id,
            name: avatarBasesTable.name,
            fileId: avatarBasesTable.fileId,
            previewFileId: avatarBasesTable.previewFileId,
            isDefault: avatarBasesTable.isDefault,
        })
        .from(avatarBasesTable)
        .where(
            and(
                // A mannequin is for the admin preview, never a choice.
                eq(avatarBasesTable.kind, AVATAR_BASE_KINDS.BODY),
                baseId === null
                    ? isNull(avatarBasesTable.deletedAt)
                    : or(
                          isNull(avatarBasesTable.deletedAt),
                          eq(avatarBasesTable.id, baseId)
                      )
            )
        )
        .orderBy(desc(avatarBasesTable.isDefault), asc(avatarBasesTable.name));

    return {
        categories: categories.map(({ slot, name, previewFileId }) => ({
            slot,
            name,
            previewUrl: toUrl(previewFileId),
        })),
        bases: bases.map((base) => ({
            id: base.id,
            name: base.name,
            url: buildFileUrl(base.fileId),
            previewUrl: toUrl(base.previewFileId),
            isDefault: base.isDefault,
        })),
        current: {
            baseId,
            parts: [...currentParts]
                .sort((a, b) => slotPosition(a.slot) - slotPosition(b.slot))
                .map((part) => ({
                    slot: part.slot,
                    partId: part.partId,
                    familyId: part.basePartId ?? part.partId,
                    url: buildFileUrl(part.fileId),
                })),
        },
    };
};
