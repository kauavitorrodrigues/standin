import { userSelect } from "../consts/select";
import {
    db,
    usersTable,
    userIdentitiesTable,
    userProfilePicturesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import type { User } from "@standin/contracts";
import { profilePictureJoin } from "../utils/profilePictureJoin";
import { toUser } from "../utils/toUser";
import type { IdentityKey } from "./types";

/**
 * The active person who owns this provider account, or null. A deleted person
 * never comes back from here, so the sign in cannot reactivate them.
 */
export const findUserByIdentity = async ({
    provider,
    providerUserId,
}: IdentityKey): Promise<User | null> => {
    const [user] = await db
        .select(userSelect)
        .from(userIdentitiesTable)
        .innerJoin(usersTable, eq(userIdentitiesTable.userId, usersTable.id))
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(
            and(
                eq(userIdentitiesTable.provider, provider),
                eq(userIdentitiesTable.providerUserId, providerUserId),
                isNull(usersTable.deletedAt)
            )
        );

    return user ? toUser(user) : null;
};
