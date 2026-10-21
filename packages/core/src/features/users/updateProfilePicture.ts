import {
    db,
    eq,
    userProfilePicturesTable,
    usersTable,
} from "@standin/database";
import type { UpdateProfilePictureAction, User } from "@standin/contracts";
import { FileService } from "../files";
import { PROFILE_PICTURE_FOLDER, PROFILE_PICTURE_FOLDER_NAME } from "./consts";
import { publishUserProfilePictureChanged } from "./utils/profilePictureEvents";
import { readUser } from "./utils/readUser";

/**
 * Persists the profile picture a controller already processed: a "set" action
 * carries the final PNG, a "remove" action clears it. The core never decodes
 * an image. One path for every source (the upload and, later, the import from
 * GitHub).
 *
 * The new file is uploaded first. Then one transaction locks the user row, so
 * two requests of the same person run one at a time, creates, replaces or
 * deletes the picture row and soft deletes the old `files` row. The old object
 * leaves storage only after the commit, and a failure to remove it is logged.
 * If the transaction fails, the new file is removed and the old one is
 * untouched. Removing when there is no picture is not an error.
 */
export const updateProfilePicture = async (
    userId: string,
    action: UpdateProfilePictureAction
): Promise<User> => {
    const file =
        action.action === "set"
            ? await FileService.upload(action.file, {
                  folder: `${PROFILE_PICTURE_FOLDER}/${userId}/${PROFILE_PICTURE_FOLDER_NAME}`,
              })
            : null;

    let replacedKeys: string[] | null;
    try {
        replacedKeys = await db.transaction(async (tx) => {
            await tx
                .select({ id: usersTable.id })
                .from(usersTable)
                .where(eq(usersTable.id, userId))
                .for("update");

            const [existing] = await tx
                .select({ fileId: userProfilePicturesTable.fileId })
                .from(userProfilePicturesTable)
                .where(eq(userProfilePicturesTable.userId, userId))
                .for("update");

            if (file) {
                await tx
                    .insert(userProfilePicturesTable)
                    .values({ userId, fileId: file.id })
                    .onConflictDoUpdate({
                        target: userProfilePicturesTable.userId,
                        set: { fileId: file.id, updatedAt: new Date() },
                    });
            } else {
                await tx
                    .delete(userProfilePicturesTable)
                    .where(eq(userProfilePicturesTable.userId, userId));
            }

            // Nothing changed when there was no picture to remove.
            if (!file && !existing) return null;

            return FileService.softDeleteManyByIds(
                existing ? [existing.fileId] : [],
                tx
            );
        });
    } catch (error) {
        if (file) await FileService.delete(file.id).catch(console.error);
        throw error;
    }

    if (replacedKeys) await FileService.purge(replacedKeys);

    const user = await readUser(userId);

    // The picture is saved either way, so the answer does not wait for the
    // listeners (see `publishUserProfilePictureChanged`, which logs failures).
    if (replacedKeys) {
        void publishUserProfilePictureChanged({
            userId,
            profilePictureUrl: user.profilePictureUrl,
        });
    }

    return user;
};
