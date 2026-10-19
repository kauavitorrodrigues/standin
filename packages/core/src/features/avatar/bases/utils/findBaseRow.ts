import { and, avatarBasesTable, db, eq, isNull } from "@standin/database";
import { AvatarBaseNotFoundError } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { avatarBaseSelect } from "../consts/select";
import type { AvatarBaseRow } from "./types";

/** A base that is not deleted, or `AvatarBaseNotFoundError` (404). */
export const findActiveBaseRow = async (
    baseId: string,
    executor: DbExecutor = db
): Promise<AvatarBaseRow> => {
    const [row] = await executor
        .select(avatarBaseSelect)
        .from(avatarBasesTable)
        .where(
            and(
                eq(avatarBasesTable.id, baseId),
                isNull(avatarBasesTable.deletedAt)
            )
        );
    if (!row) throw new AvatarBaseNotFoundError();
    return row;
};
