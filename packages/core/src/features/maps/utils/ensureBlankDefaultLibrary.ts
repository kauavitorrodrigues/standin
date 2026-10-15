import { db, usersTable, and, eq, isNull } from "@standin/database";
import { USER_ROLES } from "@standin/contracts";
import { DEFAULT_LIBRARY_SEED } from "../../assets/library/consts/defaultSeed";
import { seedLibrary } from "../../assets/seed/seedLibrary";

/**
 * Seeds the placeholder global library (the same one `seed:library` uses) so a
 * blank map can be built when the library has no default floor yet. Idempotent
 * by key. Returns false when there is no admin to own the seeded items.
 */
export const ensureBlankDefaultLibrary = async (): Promise<boolean> => {
    const [admin] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
            and(
                eq(usersTable.role, USER_ROLES.ADMIN),
                isNull(usersTable.deletedAt)
            )
        )
        .limit(1);
    if (!admin) return false;

    await seedLibrary(DEFAULT_LIBRARY_SEED, { createdBy: admin.id });
    return true;
};
