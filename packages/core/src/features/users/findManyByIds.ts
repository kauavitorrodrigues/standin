import { userSummarySelect } from "./consts/select";
import {
    db,
    usersTable,
    userProfilePicturesTable,
    inArray,
    isNull,
    and,
} from "@standin/database";
import type { UserSummary } from "@standin/contracts";
import { profilePictureJoin } from "./utils/profilePictureJoin";
import { toUserSummary } from "./utils/toUserSummary";

export const findUsersByIds = async (ids: string[]): Promise<UserSummary[]> => {
    if (ids.length === 0) return [];

    const rows = await db
        .select(userSummarySelect)
        .from(usersTable)
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(and(inArray(usersTable.id, ids), isNull(usersTable.deletedAt)));

    return rows.map(toUserSummary);
};
