import {
    db,
    usersTable,
    userIdentitiesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { normalizeEmail, UserAlreadyExistsError } from "@standin/contracts";
import { assignRandomAvatar } from "../../avatar/user/assignRandomAvatar";
import { isUniqueViolation } from "../../../lib/isUniqueViolation";
import { readUser } from "../utils/readUser";
import { findUserByIdentity } from "./findByIdentity";
import { releaseDeletedIdentity } from "./releaseDeletedIdentity";
import type {
    CreateFromIdentityInput,
    CreateFromIdentityResult,
} from "./types";

/**
 * Creates a person who signs in with a provider: no password, the name and the
 * verified e-mail the API read, and the link to the provider account. The only
 * place of this flow that gives a random avatar.
 *
 * The person and the link are written in one transaction. When two requests
 * race, the unique index refuses one of them and that one reads the winner
 * instead of creating a second person.
 */
export const createUserFromIdentity = async ({
    identity,
    name,
    email,
}: CreateFromIdentityInput): Promise<CreateFromIdentityResult> => {
    const normalizedEmail = normalizeEmail(email);

    let createdId: string;
    try {
        createdId = await db.transaction(async (tx) => {
            await releaseDeletedIdentity(tx, identity);

            const [existingUser] = await tx
                .select({ id: usersTable.id })
                .from(usersTable)
                .where(
                    and(
                        eq(usersTable.email, normalizedEmail),
                        isNull(usersTable.deletedAt)
                    )
                );
            if (existingUser) throw new UserAlreadyExistsError();

            const [created] = await tx
                .insert(usersTable)
                .values({ name, email: normalizedEmail, password: null })
                .returning({ id: usersTable.id });

            await tx
                .insert(userIdentitiesTable)
                .values({ userId: created.id, ...identity });

            return created.id;
        });
    } catch (error) {
        if (!isUniqueViolation(error)) throw error;

        const winner = await findUserByIdentity(identity);
        if (!winner) throw new UserAlreadyExistsError();
        return { user: winner, created: false };
    }

    // It never fails the sign in, and an empty catalog leaves the ghost.
    await assignRandomAvatar(createdId);

    return { user: await readUser(createdId), created: true };
};
