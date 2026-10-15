import { db, areasTable, usersTable, desc, eq } from "@standin/database";
import type { AreaListQuery, AreaSummary } from "@standin/contracts";
import { areaSelect } from "./consts/select";
import { normalizeSearch } from "./utils/normalizeSearch";
import { liveAreaInScope } from "./utils/scope";
import { toAreaSummary } from "./utils/toAreaSummary";

/**
 * The live areas of a scope, newest first. The search ignores case and
 * accents, and runs here so the client only renders.
 */
export const listAreas = async (
    organizationId: string | null,
    { search }: Partial<AreaListQuery> = {}
): Promise<AreaSummary[]> => {
    const rows = await db
        .select(areaSelect)
        .from(areasTable)
        .leftJoin(usersTable, eq(usersTable.id, areasTable.createdBy))
        .where(liveAreaInScope(organizationId))
        .orderBy(desc(areasTable.createdAt));

    const term = search ? normalizeSearch(search) : "";
    return rows
        .filter((row) => normalizeSearch(row.name).includes(term))
        .map(toAreaSummary);
};
