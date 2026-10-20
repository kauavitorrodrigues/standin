import { avatarPartsTable, db, eq, or } from "@standin/database";
import { AvatarPartNotFoundError } from "@standin/contracts";
import type { AvatarPart } from "@standin/contracts";
import { avatarPartSelect } from "../consts/select";
import { toAvatarPart } from "./toAvatarPart";

/**
 * The family of a row as the admin page sees it, deleted or not. The id can
 * be the one of the base or of any variation, the answer always has the base
 * on top and every row of the family in `variations`.
 */
export const loadAvatarPart = async (partId: string): Promise<AvatarPart> => {
    const [row] = await db
        .select(avatarPartSelect)
        .from(avatarPartsTable)
        .where(eq(avatarPartsTable.id, partId));
    if (!row) throw new AvatarPartNotFoundError();

    const familyId = row.basePartId ?? row.id;
    const family = await db
        .select(avatarPartSelect)
        .from(avatarPartsTable)
        .where(
            or(
                eq(avatarPartsTable.id, familyId),
                eq(avatarPartsTable.basePartId, familyId)
            )
        );
    const base = family.find((member) => member.id === familyId);
    if (!base) throw new AvatarPartNotFoundError();
    return toAvatarPart(base, family);
};
