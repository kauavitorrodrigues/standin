import {
    db,
    eq,
    userProfilePicturesTable,
    usersTable,
} from "@standin/database";
import { UserNotFoundError } from "@standin/contracts";
import type { User } from "@standin/contracts";
import { userSelect } from "../consts/select";
import { profilePictureJoin } from "./profilePictureJoin";
import { toUser } from "./toUser";

/**
 * Reads a person by id, deleted or not. `UPDATE ... RETURNING` cannot join the
 * profile picture, so the writes read the person again with this.
 */
export const readUser = async (id: string): Promise<User> => {
    const [row] = await db
        .select(userSelect)
        .from(usersTable)
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(eq(usersTable.id, id));

    if (!row) throw new UserNotFoundError();

    return toUser(row);
};
