import {
    avatarPartsTable,
    db,
    and,
    eq,
    isNull,
    ne,
    or,
} from "@standin/database";
import { AvatarVariationColorTakenError } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";

/**
 * Throws `AvatarVariationColorTakenError` (409) when another active row of the
 * family already has the color name. `exceptId` is the row being changed.
 */
export const assertFamilyColorFree = async (
    familyId: string,
    colorKey: string,
    exceptId: string | null,
    executor: DbExecutor = db
): Promise<void> => {
    const [taken] = await executor
        .select({ id: avatarPartsTable.id })
        .from(avatarPartsTable)
        .where(
            and(
                or(
                    eq(avatarPartsTable.id, familyId),
                    eq(avatarPartsTable.basePartId, familyId)
                ),
                eq(avatarPartsTable.colorKey, colorKey),
                isNull(avatarPartsTable.deletedAt),
                exceptId === null
                    ? undefined
                    : ne(avatarPartsTable.id, exceptId)
            )
        );
    if (taken) throw new AvatarVariationColorTakenError();
};
