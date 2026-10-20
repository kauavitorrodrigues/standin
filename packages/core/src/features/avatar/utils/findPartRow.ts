import { avatarPartsTable, db, and, eq, isNull } from "@standin/database";
import { AvatarPartNotFoundError } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { avatarPartSelect } from "../consts/select";
import type { AvatarPartRow } from "../types";

/** A part that is not deleted, or `AvatarPartNotFoundError` (404). */
export const findActivePartRow = async (
    partId: string,
    executor: DbExecutor = db
): Promise<AvatarPartRow> => {
    const [row] = await executor
        .select(avatarPartSelect)
        .from(avatarPartsTable)
        .where(
            and(
                eq(avatarPartsTable.id, partId),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    if (!row) throw new AvatarPartNotFoundError();
    return row;
};
