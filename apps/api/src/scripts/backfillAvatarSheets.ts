import { db, userAvatarPartsTable } from "@standin/database";
import { AvatarService } from "@standin/core";

// Assembles again the sheet of every person who has avatar parts and whose
// stored sheet is out of date. Joining a space no longer does it, so this is
// run once after the deploy that removed the lazy refresh. Idempotent: a sheet
// that is up to date is left alone. A failure for one person is logged and does
// not stop the others.
async function backfillAvatarSheets() {
    const rows = await db
        .selectDistinct({ userId: userAvatarPartsTable.userId })
        .from(userAvatarPartsTable);

    let failures = 0;
    for (const { userId } of rows) {
        try {
            await AvatarService.ensureSheetUpToDate(userId);
        } catch (error) {
            failures += 1;
            console.error(userId, error);
        }
    }
    console.log(`Visited ${rows.length} people, ${failures} failed.`);
    return failures;
}

backfillAvatarSheets()
    .then((failures) => process.exit(failures > 0 ? 1 : 0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
