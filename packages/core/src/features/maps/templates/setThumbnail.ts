import {
    db,
    mapTemplatesTable,
    mapsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import {
    MapTemplateNotFoundError,
    UnsupportedFileTypeError,
} from "@standin/contracts";
import type { UploadFileInput } from "@standin/contracts";
import { ROW_LOCK_MODES } from "../../../lib/consts/locks";
import { readPngSize } from "../../../lib/readPngSize";
import { FileService } from "../../files";
import { templateThumbnailSelect } from "./consts/select";
import {
    TEMPLATE_THUMBNAIL_FILE_NAME,
    TEMPLATE_THUMBNAIL_MIME_TYPE,
    TEMPLATES_STORAGE_FOLDER,
} from "./consts/storage";
import { findTemplateById } from "./findById";
import type { ThumbnailResult } from "./types/thumbnail-result";
import { checkThumbnailAspect } from "./utils/checkThumbnailAspect";

/**
 * Stores the thumbnail the editor rendered. A wrong proportion is only a
 * warning, since the thumbnail is regenerated after edits.
 *
 * The file must be a PNG by its bytes, not by what the client declared, and it
 * is stored under a fixed name and type.
 *
 * One transaction locks the template row, points it at the new file and soft
 * deletes the old `files` row. The old object leaves storage only after the
 * commit, and a failure to remove it is logged. If the transaction fails, the
 * new file is removed and the old one is untouched.
 */
export const setTemplateThumbnail = async (
    id: string,
    file: UploadFileInput
): Promise<ThumbnailResult> => {
    if (!readPngSize(file.buffer)) throw new UnsupportedFileTypeError();

    const isTheTemplate = and(
        eq(mapTemplatesTable.id, id),
        isNull(mapTemplatesTable.deletedAt)
    );

    const [row] = await db
        .select(templateThumbnailSelect)
        .from(mapTemplatesTable)
        .innerJoin(mapsTable, eq(mapsTable.id, mapTemplatesTable.mapId))
        .where(isTheTemplate);

    if (!row) throw new MapTemplateNotFoundError();

    const thumbnail = await FileService.upload(
        {
            ...file,
            originalname: TEMPLATE_THUMBNAIL_FILE_NAME,
            mimetype: TEMPLATE_THUMBNAIL_MIME_TYPE,
        },
        { folder: `${TEMPLATES_STORAGE_FOLDER}/${id}` }
    );

    let replacedKeys: string[];
    try {
        replacedKeys = await db.transaction(async (tx) => {
            const [current] = await tx
                .select({ thumbnailFileId: mapTemplatesTable.thumbnailFileId })
                .from(mapTemplatesTable)
                .where(isTheTemplate)
                .for(ROW_LOCK_MODES.UPDATE);

            // Deleted since the check above.
            if (!current) throw new MapTemplateNotFoundError();

            await tx
                .update(mapTemplatesTable)
                .set({ thumbnailFileId: thumbnail.id })
                .where(eq(mapTemplatesTable.id, id));

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

    return {
        template: await findTemplateById(id),
        warnings: checkThumbnailAspect(file, row),
    };
};
