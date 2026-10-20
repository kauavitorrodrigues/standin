import { AVATAR_BASE_KINDS } from "@standin/contracts";
import {
    avatarBasesTable,
    db,
    eq,
    isNull,
    userAvatarBasesTable,
    userAvatarSheetsTable,
} from "@standin/database";
import { publishAvatarSheetChanged } from "../utils/sheetEvents";
import { ensureSheetUpToDate } from "./ensureSheetUpToDate";

// The people drawn on a base: the ones that chose it and, when it is the
// default one, the ones with a sheet that never chose any base. A mannequin is
// nobody's body, so nobody is drawn on it.
const findUsersOfBase = async (baseId: string): Promise<string[]> => {
    const [base] = await db
        .select({
            isDefault: avatarBasesTable.isDefault,
            kind: avatarBasesTable.kind,
        })
        .from(avatarBasesTable)
        .where(eq(avatarBasesTable.id, baseId));
    if (base?.kind !== AVATAR_BASE_KINDS.BODY) return [];

    const chosen = await db
        .select({ userId: userAvatarBasesTable.userId })
        .from(userAvatarBasesTable)
        .where(eq(userAvatarBasesTable.baseId, baseId));

    if (!base.isDefault) return chosen.map(({ userId }) => userId);

    const implicit = await db
        .select({ userId: userAvatarSheetsTable.userId })
        .from(userAvatarSheetsTable)
        .leftJoin(
            userAvatarBasesTable,
            eq(userAvatarBasesTable.userId, userAvatarSheetsTable.userId)
        )
        .where(isNull(userAvatarBasesTable.id));

    return [...new Set([...chosen, ...implicit].map(({ userId }) => userId))];
};

const hasAssembledSheet = async (userId: string): Promise<boolean> => {
    const [sheet] = await db
        .select({ id: userAvatarSheetsTable.id })
        .from(userAvatarSheetsTable)
        .where(eq(userAvatarSheetsTable.userId, userId));
    return sheet !== undefined;
};

/**
 * Active refresh after the sheet of a base was swapped or the default base
 * changed: every person drawn on it gets the sheet assembled again, one at a
 * time through the queue. A person with parts goes through `ensureSheetUpToDate`
 * (which tells the listeners when the sheet changes). A person with no parts is
 * drawn with the file of the base itself, so the listeners are told here. A
 * failure for one person is logged and does not stop the others, because the
 * lazy refresh will try again when that person joins a space. Call it before
 * the old file of the base is deleted. People with no choice at all are not
 * listed, they get the new file when they join a space. Returns how many people
 * were visited.
 */
export const regenerateForBase = async (baseId: string): Promise<number> => {
    const userIds = await findUsersOfBase(baseId);

    for (const userId of userIds) {
        try {
            const avatarSheetFileId = await ensureSheetUpToDate(userId);
            if (!(await hasAssembledSheet(userId))) {
                await publishAvatarSheetChanged({ userId, avatarSheetFileId });
            }
        } catch (error) {
            console.error(error);
        }
    }
    return userIds.length;
};
