import {
    db,
    usersTable,
    userIdentitiesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { normalizeEmail } from "@standin/contracts";
import type { User } from "@standin/contracts";
import { isUniqueViolation } from "../../../lib/isUniqueViolation";
import { readUser } from "../utils/readUser";
import { findUserByIdentity } from "./findByIdentity";
import { releaseDeletedIdentity } from "./releaseDeletedIdentity";
import type { LinkIdentityInput } from "./types";

/**
 * Links a provider account to the active person who has this e-mail. The API
 * only calls it with the verified primary e-mail of the provider. Returns null
 * when nobody has the e-mail. It touches nothing of the person besides the new
 * link: not the avatar, not the picture, not the name.
 *
 * If another request linked the same provider account first, the unique index
 * refuses the second link and the owner of the first one is returned.
 */
export const linkIdentity = async ({
    identity,
    email,
}: LinkIdentityInput): Promise<User | null> => {
    const [target] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
            and(
                eq(usersTable.email, normalizeEmail(email)),
                isNull(usersTable.deletedAt)
            )
        );

    if (!target) return null;

    try {
        await db.transaction(async (tx) => {
            await releaseDeletedIdentity(tx, identity);
            await tx
                .insert(userIdentitiesTable)
                .values({ userId: target.id, ...identity });
        });
    } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        return findUserByIdentity(identity);
    }

    return readUser(target.id);
};
