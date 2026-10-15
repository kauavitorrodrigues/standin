import {
    db,
    mapTemplatesTable,
    mapsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { MapTemplateNotFoundError } from "@standin/contracts";
import type { UploadFileInput } from "@standin/contracts";
import { FileService } from "../../files";
import { templateThumbnailSelect } from "./consts/select";
import { TEMPLATES_STORAGE_FOLDER } from "./consts/storage";
import { findTemplateById } from "./findById";
import type { ThumbnailResult } from "./types/thumbnail-result";
import { checkThumbnailAspect } from "./utils/checkThumbnailAspect";

/**
 * Stores the thumbnail the editor rendered. A wrong proportion is only a
 * warning, since the thumbnail is regenerated after edits.
 */
export const setTemplateThumbnail = async (
    id: string,
    file: UploadFileInput
): Promise<ThumbnailResult> => {
    const [row] = await db
        .select(templateThumbnailSelect)
        .from(mapTemplatesTable)
        .innerJoin(mapsTable, eq(mapsTable.id, mapTemplatesTable.mapId))
        .where(
            and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
        );

    if (!row) throw new MapTemplateNotFoundError();

    const thumbnail = await FileService.upload(file, {
        folder: `${TEMPLATES_STORAGE_FOLDER}/${id}`,
    });

    await db.transaction(async (tx) => {
        await tx
            .update(mapTemplatesTable)
            .set({ thumbnailFileId: thumbnail.id })
            .where(eq(mapTemplatesTable.id, id));

        if (row.thumbnailFileId) {
            await FileService.deleteManyByIds([row.thumbnailFileId], tx);
        }
    });

    return {
        template: await findTemplateById(id),
        warnings: checkThumbnailAspect(file, row),
    };
};
