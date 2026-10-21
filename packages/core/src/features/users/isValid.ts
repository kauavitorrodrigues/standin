import bcrypt from "bcryptjs";
import { userSelect } from "./consts/select";
import {
    db,
    usersTable,
    userProfilePicturesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { normalizeEmail } from "@standin/contracts";
import type { SignInSchemaType, User } from "@standin/contracts";
import { profilePictureJoin } from "./utils/profilePictureJoin";
import { toUser } from "./utils/toUser";

export const isUserValid = async ({
    email,
    password,
}: SignInSchemaType): Promise<User | false> => {
    const [user] = await db
        .select({ ...userSelect, password: usersTable.password })
        .from(usersTable)
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(
            and(
                eq(usersTable.email, normalizeEmail(email)),
                isNull(usersTable.deletedAt)
            )
        );

    if (!user) return false;

    // A person who only signs in with a provider has no password to check.
    if (!user.password) return false;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return false;

    const { password: _password, ...safeUser } = user;

    return toUser(safeUser);
};
