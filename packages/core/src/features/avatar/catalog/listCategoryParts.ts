import {
    and,
    asc,
    avatarPartsTable,
    db,
    eq,
    inArray,
    isNull,
    sql,
} from "@standin/database";
import { AVATAR_PARTS_PAGE } from "@standin/contracts";
import type {
    AvatarCategoryPartItem,
    AvatarCategoryPartsPage,
    AvatarCategoryPartVariation,
    AvatarSlot,
} from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import { decodePartsCursor, encodePartsCursor } from "../utils/partsCursor";

type ListCategoryPartsInput = {
    slot: AvatarSlot;
    cursor?: string;
    limit?: number;
};

const variationSelect = {
    id: avatarPartsTable.id,
    basePartId: avatarPartsTable.basePartId,
    colorKey: avatarPartsTable.colorKey,
    colorHex: avatarPartsTable.colorHex,
    fileId: avatarPartsTable.fileId,
    previewFileId: avatarPartsTable.previewFileId,
};

type VariationRow = {
    id: string;
    basePartId: string | null;
    colorKey: string | null;
    colorHex: string | null;
    fileId: string;
    previewFileId: string;
};

const toVariation = (row: VariationRow): AvatarCategoryPartVariation => ({
    id: row.id,
    colorKey: row.colorKey,
    colorHex: row.colorHex,
    url: buildFileUrl(row.fileId),
    previewUrl: buildFileUrl(row.previewFileId),
});

/**
 * One page of the parts of a category, for the infinite list of the editor.
 * The page is made of families (base parts, ordered by name and id), each with
 * its active color variations, the base row first. The pagination is by
 * keyset on `(name, id)`, so a part registered while someone scrolls does not
 * repeat or skip an item, and it is served by `avatar_parts_slot_name_id_index`.
 * The variations of the whole page come in one query. Deleted parts are left
 * out. `nextCursor` is null on the last page.
 */
export const listCategoryParts = async ({
    slot,
    cursor,
    limit = AVATAR_PARTS_PAGE.default,
}: ListCategoryPartsInput): Promise<AvatarCategoryPartsPage> => {
    const after = cursor === undefined ? null : decodePartsCursor(cursor);
    const size = Math.min(Math.max(limit, 1), AVATAR_PARTS_PAGE.max);

    const bases = await db
        .select({ ...variationSelect, name: avatarPartsTable.name })
        .from(avatarPartsTable)
        .where(
            and(
                eq(avatarPartsTable.slot, slot),
                isNull(avatarPartsTable.basePartId),
                isNull(avatarPartsTable.deletedAt),
                after === null
                    ? undefined
                    : sql`(${avatarPartsTable.name}, ${avatarPartsTable.id}) > (${after.name}, ${after.id})`
            )
        )
        .orderBy(asc(avatarPartsTable.name), asc(avatarPartsTable.id))
        .limit(size + 1);

    const hasMore = bases.length > size;
    const page = hasMore ? bases.slice(0, size) : bases;

    const children =
        page.length === 0
            ? []
            : await db
                  .select(variationSelect)
                  .from(avatarPartsTable)
                  .where(
                      and(
                          inArray(
                              avatarPartsTable.basePartId,
                              page.map(({ id }) => id)
                          ),
                          isNull(avatarPartsTable.deletedAt)
                      )
                  )
                  .orderBy(
                      asc(avatarPartsTable.createdAt),
                      asc(avatarPartsTable.id)
                  );

    const items: AvatarCategoryPartItem[] = page.map((base) => ({
        id: base.id,
        name: base.name,
        previewUrl: buildFileUrl(base.previewFileId),
        variations: [
            toVariation(base),
            ...children
                .filter(({ basePartId }) => basePartId === base.id)
                .map(toVariation),
        ],
    }));

    const last = page[page.length - 1];
    return {
        items,
        nextCursor:
            hasMore && last
                ? encodePartsCursor({ name: last.name, id: last.id })
                : null,
    };
};
