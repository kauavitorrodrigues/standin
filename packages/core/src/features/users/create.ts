import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "./consts";
import { userSelect } from "./consts/select";
import { db, usersTable, eq, and, isNull } from "@standin/database";
import { normalizeEmail, UserAlreadyExistsError } from "@standin/contracts";
import type { User, UserDataSchemaType } from "@standin/contracts";

export const createUser = async (data: UserDataSchemaType): Promise<User> => {
    const { name, email, password: rawPassword } = data;
    const normalizedEmail = normalizeEmail(email);

    const [existingUser] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
            and(
                eq(usersTable.email, normalizedEmail),
                isNull(usersTable.deletedAt)
            )
        );

    if (existingUser) throw new UserAlreadyExistsError();

    const password = await bcrypt.hash(rawPassword, BCRYPT_SALT_ROUNDS);

    const [user] = await db
        .insert(usersTable)
        .values({ name, email: normalizedEmail, password })
        .returning(userSelect);

    return user;
};
