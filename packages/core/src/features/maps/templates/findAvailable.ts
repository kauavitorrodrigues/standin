import { db, mapTemplatesTable, and, eq, isNull, or } from "@standin/database";
import { MAP_TEMPLATE_STATUSES } from "@standin/contracts";
import { templateAvailableSelect } from "./consts/select";
import type { AvailableTemplate } from "./types/available-template";

/**
 * A template an organization can start a space from: published, not deleted,
 * and global or the organization's own.
 */
export const findAvailableTemplate = async (
    templateId: string,
    organizationId: string
): Promise<AvailableTemplate | null> => {
    const [template] = await db
        .select(templateAvailableSelect)
        .from(mapTemplatesTable)
        .where(
            and(
                eq(mapTemplatesTable.id, templateId),
                eq(mapTemplatesTable.status, MAP_TEMPLATE_STATUSES.PUBLISHED),
                isNull(mapTemplatesTable.deletedAt),
                or(
                    isNull(mapTemplatesTable.organizationId),
                    eq(mapTemplatesTable.organizationId, organizationId)
                )
            )
        );

    return template ?? null;
};
