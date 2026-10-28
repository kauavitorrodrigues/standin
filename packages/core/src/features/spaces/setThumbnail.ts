import { ROW_LOCK_MODES } from "../../lib/consts/locks";
import { readPngSize } from "../../lib/readPngSize";
import { db, spacesTable, and, eq, isNull } from "@standin/database";
import {
    SpaceNotFoundError,
    UnsupportedFileTypeError,
} from "@standin/contracts";
import type { Space, UploadFileInput } from "@standin/contracts";
import { FileService } from "../files";
import {
    SPACE_THUMBNAIL_FILE_NAME,
    SPACE_THUMBNAIL_MIME_TYPE,
    SPACES_STORAGE_FOLDER,
} from "./consts/storage";
import { findSpaceById } from "./findById";

/**
 * Stores the photo of the map that the editor or the creation form rendered,
 * and replaces the one it had.
 *
 * The file must be a PNG by its bytes, not by what the client declared, and it
 * is stored under a fixed name and type. Then one transaction locks the space
 * row, so two photos saved at the same moment run one at a time, points the
 * space at the new file and soft deletes the old `files` row. The old object
 * leaves storage only after the commit, and a failure to remove it is logged.
 * If the transaction fails, the new file is removed and the old one is
 * untouched.
 */
export const setSpaceThumbnail = async (
    organizationId: string,
    id: string,
    file: UploadFileInput
): Promise<Space> => {
    if (!readPngSize(file.buffer)) throw new UnsupportedFileTypeError();

    // Fails before the upload, so a missing space leaves no file behind.
    await findSpaceById(organizationId, id);

    const thumbnail = await FileService.upload(
        {
            ...file,
            originalname: SPACE_THUMBNAIL_FILE_NAME,
            mimetype: SPACE_THUMBNAIL_MIME_TYPE,
        },
        { folder: `${SPACES_STORAGE_FOLDER}/${id}` }
    );

    let replacedKeys: string[];
    try {
        replacedKeys = await db.transaction(async (tx) => {
            const isTheSpace = and(
                eq(spacesTable.id, id),
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            );

            const [current] = await tx
                .select({ thumbnailFileId: spacesTable.thumbnailFileId })
                .from(spacesTable)
                .where(isTheSpace)
                .for(ROW_LOCK_MODES.UPDATE);

            // Deleted since the check above.
            if (!current) throw new SpaceNotFoundError();

            await tx
                .update(spacesTable)
                .set({ thumbnailFileId: thumbnail.id })
                .where(isTheSpace);

            return FileService.softDeleteManyByIds(
                current.thumbnailFileId ? [current.thumbnailFileId] : [],
                tx
            );
        });
    } catch (error) {
        await FileService.delete(thumbnail.id).catch(console.error);
        throw error;
    }

    await FileService.purge(replacedKeys);

    return findSpaceById(organizationId, id);
};
