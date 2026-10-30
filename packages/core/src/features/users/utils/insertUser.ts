import bcrypt from "bcryptjs";
import { db, usersTable, eq, and, isNull } from "@standin/database";
import { normalizeEmail, UserAlreadyExistsError } from "@standin/contracts";
import type { UserDataSchemaType } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { BCRYPT_SALT_ROUNDS } from "../consts";

/** Writes the row of a new person with a password and returns its id. */
export const insertUser = async (
    data: UserDataSchemaType,
    executor: DbExecutor = db
): Promise<string> => {
    const { name, email, password: rawPassword } = data;
    const normalizedEmail = normalizeEmail(email);

    const [existingUser] = await executor
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

    const [created] = await executor
        .insert(usersTable)
        .values({ name, email: normalizedEmail, password })
        .returning({ id: usersTable.id });

    return created.id;
};
