import { db, usersTable, and, eq, isNull } from "@standin/database";
import { LibrarySeedAdminNotFoundError, USER_ROLES } from "@standin/contracts";
import {
    AssetService,
    DEFAULT_LIBRARY_SEED,
    readLibraryFolder,
} from "@standin/core";

// Seeds the global library through the same services the HTTP endpoints use.
// With a folder argument it reads `library.json` and its PNGs from there (see
// readLibraryFolder), without one it seeds the placeholder library that blank
// maps are built from. Idempotent by key: running it again changes nothing,
// and it never deletes.
async function seedLibrary() {
    const folder = process.argv[2];
    const seed = folder
        ? await readLibraryFolder(folder)
        : DEFAULT_LIBRARY_SEED;

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
    if (!admin) {
        throw new LibrarySeedAdminNotFoundError();
    }

    const result = await AssetService.seed(seed, { createdBy: admin.id });

    for (const { key, action } of result.tilesets) {
        console.log(`✓ tileset ${key}: ${action}`);
    }
    for (const { key, action } of result.assets) {
        console.log(`✓ asset ${key}: ${action}`);
    }
    for (const { key, action } of result.bundles) {
        console.log(`✓ bundle ${key}: ${action}`);
    }
    for (const { key, action } of result.areas) {
        console.log(`✓ area ${key}: ${action}`);
    }
    for (const { key, action } of result.avatarBases) {
        console.log(`✓ avatar base ${key}: ${action}`);
    }
    for (const { key, action } of result.avatarParts) {
        console.log(`✓ avatar part ${key}: ${action}`);
    }
    process.exit(0);
}

seedLibrary().catch((error) => {
    console.error(error);
    process.exit(1);
});
