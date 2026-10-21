import { userSelect } from "./consts/select";
import {
    db,
    usersTable,
    userProfilePicturesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import type { User } from "@standin/contracts";
import { profilePictureJoin } from "./utils/profilePictureJoin";
import { toUser } from "./utils/toUser";

export const findUserById = async (id: string): Promise<User | null> => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)));

    return user ? toUser(user) : null;
};
