import {
    avatarPartsTable,
    db,
    and,
    asc,
    eq,
    ilike,
    inArray,
    isNull,
    or,
} from "@standin/database";
import { AVATAR_SLOT_TABS } from "@standin/contracts";
import type { AvatarPartList, AvatarPartListQuery } from "@standin/contracts";
import { avatarPartSelect } from "../consts/select";
import { toAvatarPart } from "../utils/toAvatarPart";

/**
 * The parts for the admin page, already grouped by slot in the order of the
 * editor tabs (every slot shows up, even without parts). Each part is a
 * family: the base row and its color variations, the base first. Deleted rows
 * never come back. The search looks at the name and the key of the
 * base.
 */
export const listParts = async (
    query: AvatarPartListQuery
): Promise<AvatarPartList> => {
    const search = query.search ? `%${query.search}%` : null;

    const bases = await db
        .select(avatarPartSelect)
        .from(avatarPartsTable)
        .where(
            and(
                isNull(avatarPartsTable.basePartId),
                query.slot ? eq(avatarPartsTable.slot, query.slot) : undefined,
                isNull(avatarPartsTable.deletedAt),
                search
                    ? or(
                          ilike(avatarPartsTable.name, search),
                          ilike(avatarPartsTable.key, search)
                      )
                    : undefined
            )
        )
        .orderBy(asc(avatarPartsTable.name), asc(avatarPartsTable.createdAt));

    const variations =
        bases.length === 0
            ? []
            : await db
                  .select(avatarPartSelect)
                  .from(avatarPartsTable)
                  .where(
                      and(
                          inArray(
                              avatarPartsTable.basePartId,
                              bases.map(({ id }) => id)
                          ),
                          isNull(avatarPartsTable.deletedAt)
                      )
                  );

    const slots = query.slot ? [query.slot] : AVATAR_SLOT_TABS;
    return {
        slots: slots.map((slot) => ({
            slot,
            parts: bases
                .filter((base) => base.slot === slot)
                .map((base) =>
                    toAvatarPart(
                        base,
                        variations.filter((row) => row.basePartId === base.id)
                    )
                ),
        })),
    };
};
