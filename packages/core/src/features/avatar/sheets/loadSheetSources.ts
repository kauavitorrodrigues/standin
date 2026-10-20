import {
    avatarPartsTable,
    db,
    eq,
    userAvatarPartsTable,
} from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AvatarSheetSource } from "../types";
import { toSheetSources } from "./toSheetSources";

/**
 * What a person chose, with the file of each part's sheet. Deleted parts are
 * included: whoever chose a part keeps it. A color is the part itself, so
 * there is nothing else to read. The result follows the order of the editor
 * tabs.
 */
export const loadSheetSources = async (
    userId: string,
    executor: DbExecutor = db
): Promise<AvatarSheetSource[]> => {
    const rows = await executor
        .select({
            slot: userAvatarPartsTable.slot,
            partId: userAvatarPartsTable.partId,
            fileId: avatarPartsTable.fileId,
        })
        .from(userAvatarPartsTable)
        .innerJoin(
            avatarPartsTable,
            eq(avatarPartsTable.id, userAvatarPartsTable.partId)
        )
        .where(eq(userAvatarPartsTable.userId, userId));
    return toSheetSources(rows, executor);
};
