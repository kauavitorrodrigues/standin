import { ROW_LOCK_MODES } from "../../../lib/consts/locks";
import {
    db,
    mapTemplatesTable,
    mapsTable,
    mapAssetsTable,
    and,
    count,
    eq,
    isNull,
} from "@standin/database";
import {
    LAYOUT_VALIDATION_LEVELS,
    LayoutValidationError,
    MAP_TEMPLATE_STATUSES,
    MapTemplateMissingThumbnailError,
    MapTemplateNotDraftError,
    MapTemplateNotFoundError,
    MapTemplateUsesPrivateAssetsError,
    validateLayout,
} from "@standin/contracts";
import type { MapTemplate } from "@standin/contracts";
import { loadLayoutLibrary } from "../utils/loadLayoutLibrary";
import { templatePublishSelect } from "./consts/select";
import { findTemplateById } from "./findById";
import { usesNonGlobalAssets } from "./utils/usesNonGlobalAssets";

export const publishTemplate = async (id: string): Promise<MapTemplate> => {
    await db.transaction(async (tx) => {
        const [template] = await tx
            .select(templatePublishSelect)
            .from(mapTemplatesTable)
            .innerJoin(mapsTable, eq(mapsTable.id, mapTemplatesTable.mapId))
            .where(
                and(eq(mapTemplatesTable.id, id), isNull(mapTemplatesTable.deletedAt))
            )
            .for(ROW_LOCK_MODES.UPDATE, { of: mapTemplatesTable });

        if (!template) throw new MapTemplateNotFoundError();
        if (template.status !== MAP_TEMPLATE_STATUSES.DRAFT) {
            throw new MapTemplateNotDraftError();
        }
        if (!template.thumbnailFileId) {
            throw new MapTemplateMissingThumbnailError();
        }

        const tilesetImageIds = template.layout.tilesets.map(
            ({ name }) => name
        );
        if (await usesNonGlobalAssets(template.mapId, tilesetImageIds, tx)) {
            throw new MapTemplateUsesPrivateAssetsError();
        }

        const [{ objectCount }] = await tx
            .select({ objectCount: count() })
            .from(mapAssetsTable)
            .where(
                and(
                    eq(mapAssetsTable.mapId, template.mapId),
                    isNull(mapAssetsTable.deletedAt)
                )
            );

        const library = await loadLayoutLibrary(null, tilesetImageIds, tx);
        const validation = validateLayout(template.layout, library, {
            level: LAYOUT_VALIDATION_LEVELS.COMPLETE,
            sizeTier: template.sizeTier,
            objectCount,
        });
        if (validation.errors.length > 0) {
            throw new LayoutValidationError(
                validation.errors,
                validation.warnings
            );
        }

        await tx
            .update(mapTemplatesTable)
            .set({ status: MAP_TEMPLATE_STATUSES.PUBLISHED })
            .where(eq(mapTemplatesTable.id, id));
    });

    return findTemplateById(id);
};
