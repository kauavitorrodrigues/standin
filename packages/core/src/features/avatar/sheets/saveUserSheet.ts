import {
    eq,
    userAvatarBasesTable,
    userAvatarPartsTable,
    userAvatarSheetsTable,
} from "@standin/database";
import type { ChosenPart } from "./toSheetSources";
import type { AssembledSheet } from "./assembleUserSheet";
import { settleSheetChange } from "./settleSheetChange";
import { AVATAR_USER_FOLDER, AVATAR_USER_SHEET_NAME } from "../consts/storage";
import { withStoredSheets } from "../utils/withStoredSheets";

type SaveUserSheetInput = {
    userId: string;
    sheet: AssembledSheet;
    // The new choices. Leave it out to keep the stored ones, as the assembly
    // of a stale sheet does.
    parts?: readonly Pick<ChosenPart, "slot" | "partId">[];
    // The base the person chose, null for the default one. Leave it out to
    // keep the stored choice, as the assembly of a stale sheet does.
    baseId?: string | null;
};

/**
 * Stores the assembled PNG and, in one transaction, replaces the choices (parts
 * and base, when given) and the sheet row of the person. If the transaction fails the new
 * object is removed from storage. Then it tells the listeners and drops the
 * old file, see `settleSheetChange`. Returns the id of the new file.
 */
export const saveUserSheet = async ({
    userId,
    sheet,
    parts,
    baseId,
}: SaveUserSheetInput): Promise<string> => {
    const { fileId, previousFileId } = await withStoredSheets(
        [{ buffer: sheet.png, originalName: AVATAR_USER_SHEET_NAME }],
        `${AVATAR_USER_FOLDER}/${userId}`,
        async (tx, [newFileId]) => {
            if (parts) {
                await tx
                    .delete(userAvatarPartsTable)
                    .where(eq(userAvatarPartsTable.userId, userId));
                if (parts.length > 0) {
                    await tx.insert(userAvatarPartsTable).values(
                        parts.map(({ slot, partId }) => ({
                            userId,
                            slot,
                            partId,
                        }))
                    );
                }
            }
            if (baseId !== undefined) {
                await tx
                    .delete(userAvatarBasesTable)
                    .where(eq(userAvatarBasesTable.userId, userId));
                if (baseId !== null) {
                    await tx
                        .insert(userAvatarBasesTable)
                        .values({ userId, baseId });
                }
            }

            const [existing] = await tx
                .select({ fileId: userAvatarSheetsTable.fileId })
                .from(userAvatarSheetsTable)
                .where(eq(userAvatarSheetsTable.userId, userId))
                .for("update");

            await tx
                .insert(userAvatarSheetsTable)
                .values({
                    userId,
                    fileId: newFileId,
                    configHash: sheet.configHash,
                })
                .onConflictDoUpdate({
                    target: userAvatarSheetsTable.userId,
                    set: {
                        fileId: newFileId,
                        configHash: sheet.configHash,
                        updatedAt: new Date(),
                    },
                });

            return {
                fileId: newFileId,
                previousFileId: existing?.fileId ?? null,
            };
        }
    );

    await settleSheetChange(userId, fileId, previousFileId);
    return fileId;
};
