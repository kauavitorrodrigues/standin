import { ROW_LOCK_MODES } from "../../../lib/consts/locks";
import { db, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import {
    MAP_TEMPLATE_STATUSES,
    MapTemplateNotDeletableError,
    MapTemplateNotFoundError,
} from "@standin/contracts";
import { deleteMapsByIds } from "../deleteByIds";
import { templateDeletedSelect, templateStatusSelect } from "./consts/select";
import { FileService } from "../../files";

export const deleteTemplate = async (id: string): Promise<void> => {
    const storageKeys = await db.transaction(async (tx) => {
        const [current] = await tx
            .select(templateStatusSelect)
            .from(mapTemplatesTable)
            .where(
                and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
            )
            .for(ROW_LOCK_MODES.UPDATE);

        if (!current) throw new MapTemplateNotFoundError();
        // A published template is retired first, so the catalog never loses
        // one by accident.
        if (current.status === MAP_TEMPLATE_STATUSES.PUBLISHED) {
            throw new MapTemplateNotDeletableError();
        }

        const [template] = await tx
            .update(mapTemplatesTable)
            .set({ deletedAt: new Date() })
            .where(
                and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
            )
            .returning(templateDeletedSelect);

        if (!template) throw new MapTemplateNotFoundError();

        await deleteMapsByIds([template.mapId], tx);

        // The object leaves storage only after the commit, so a rollback
        // never loses a photo a live template still shows.
        return FileService.softDeleteManyByIds(
            template.thumbnailFileId ? [template.thumbnailFileId] : [],
            tx
        );
    });

    await FileService.purge(storageKeys);
};
