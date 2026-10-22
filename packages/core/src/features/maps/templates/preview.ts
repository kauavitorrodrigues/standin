import { db, mapTemplatesTable, and, eq, isNull } from "@standin/database";
import {
    MAP_TEMPLATE_STATUSES,
    MapTemplateNotFoundError,
} from "@standin/contracts";
import type { MapTemplatePreview } from "@standin/contracts";
import { buildMapRenderPayload } from "../buildRenderPayload";
import { MAP_OWNER_KINDS } from "../consts/owner";

/**
 * How a published global template looks, for anyone. A draft, a retired or a
 * deleted template, and the ones that belong to an organization, are reported
 * as missing, so the route reveals nothing about them.
 */
export const previewTemplate = async (
    templateId: string
): Promise<MapTemplatePreview> => {
    const [template] = await db
        .select({ mapId: mapTemplatesTable.mapId })
        .from(mapTemplatesTable)
        .where(
            and(
                eq(mapTemplatesTable.id, templateId),
                eq(mapTemplatesTable.status, MAP_TEMPLATE_STATUSES.PUBLISHED),
                isNull(mapTemplatesTable.organizationId),
                isNull(mapTemplatesTable.deletedAt)
            )
        );

    if (!template) throw new MapTemplateNotFoundError();

    const { map, tilesets, assets, placed } = await buildMapRenderPayload({
        mapId: template.mapId,
        owner: {
            kind: MAP_OWNER_KINDS.TEMPLATE,
            templateId,
            organizationId: null,
        },
        canRead: true,
        canEdit: false,
        canDecorate: false,
        membership: null,
        guest: null,
        canView: true,
    });

    return { map, tilesets, assets, placed };
};
