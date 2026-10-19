import { AVATAR_BASE_KINDS } from "@standin/contracts";
import {
    and,
    avatarBasesTable,
    db,
    eq,
    filesTable,
    isNull,
    userAvatarBasesTable,
} from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AvatarSheetBase } from "../types";

const baseSelect = {
    baseId: avatarBasesTable.id,
    fileId: avatarBasesTable.fileId,
    fileName: filesTable.fileName,
};

/** The default body, or null when an admin registered none. */
export const loadDefaultBase = async (
    executor: DbExecutor = db
): Promise<AvatarSheetBase | null> => {
    const [base] = await executor
        .select(baseSelect)
        .from(avatarBasesTable)
        .innerJoin(filesTable, eq(filesTable.id, avatarBasesTable.fileId))
        .where(
            and(
                eq(avatarBasesTable.kind, AVATAR_BASE_KINDS.BODY),
                eq(avatarBasesTable.isDefault, true),
                isNull(avatarBasesTable.deletedAt)
            )
        );
    return base ?? null;
};

/**
 * The base a person is drawn on: the one they chose (even if deleted since,
 * whoever chose a base keeps it) or else the default one. Null when the person
 * has no choice and no default base exists.
 */
export const loadUserBase = async (
    userId: string,
    executor: DbExecutor = db
): Promise<AvatarSheetBase | null> => {
    const [chosen] = await executor
        .select(baseSelect)
        .from(userAvatarBasesTable)
        .innerJoin(
            avatarBasesTable,
            eq(avatarBasesTable.id, userAvatarBasesTable.baseId)
        )
        .innerJoin(filesTable, eq(filesTable.id, avatarBasesTable.fileId))
        .where(eq(userAvatarBasesTable.userId, userId));
    if (chosen) return chosen;
    return loadDefaultBase(executor);
};
