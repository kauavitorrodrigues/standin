import { userSelect } from "./consts/select";
import { db, usersTable, eq } from "@standin/database";
import type { User, UserUpdateSchemaType } from "@standin/contracts";
import { publishUserNameChanged } from "./utils/nameEvents";

export const updateUser = async (
    id: string,
    data: UserUpdateSchemaType
): Promise<User> => {
    const [previous] = await db
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, id));

    const [user] = await db
        .update(usersTable)
        .set(data)
        .where(eq(usersTable.id, id))
        .returning(userSelect);

    // The profile is saved either way, so the answer does not wait for the
    // listeners: a socket adapter that is slow to answer must not hold the
    // request. A listener that fails never fails anything (see
    // `publishUserNameChanged`, which logs it).
    if (user && user.name !== previous?.name) {
        void publishUserNameChanged({ userId: user.id, name: user.name });
    }

    return user;
};
