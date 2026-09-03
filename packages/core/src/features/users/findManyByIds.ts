import { userSummarySelect } from "./consts/select";
import { db, usersTable, inArray, isNull, and } from "@standin/database";
import type { UserSummary } from "@standin/contracts";

export const findUsersByIds = async (ids: string[]): Promise<UserSummary[]> => {
    if (ids.length === 0) return [];

    return db
        .select(userSummarySelect)
        .from(usersTable)
        .where(and(inArray(usersTable.id, ids), isNull(usersTable.deletedAt)));
};
