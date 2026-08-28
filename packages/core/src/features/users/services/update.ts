import { userSelect } from "../consts/select";
import { db, usersTable, eq } from "@standin/database";
import type { User, UserUpdateSchemaType } from "@standin/contracts";

export const updateUser = async (
    id: string,
    data: UserUpdateSchemaType,
): Promise<User> => {
    const [user] = await db
        .update(usersTable)
        .set(data)
        .where(eq(usersTable.id, id))
        .returning(userSelect);

    return user;
};
