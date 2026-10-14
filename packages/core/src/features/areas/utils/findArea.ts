import { db, areasTable, usersTable, and, eq } from "@standin/database";
import { AreaNotFoundError } from "@standin/contracts";
import { areaSelect } from "../consts/select";
import type { AreaRow } from "../types";
import { liveAreaInScope } from "./scope";

export const findScopedArea = async (
    id: string,
    organizationId: string | null
): Promise<AreaRow> => {
    const [row] = await db
        .select(areaSelect)
        .from(areasTable)
        .leftJoin(usersTable, eq(usersTable.id, areasTable.createdBy))
        .where(and(eq(areasTable.id, id), liveAreaInScope(organizationId)));
    if (!row) throw new AreaNotFoundError();
    return row;
};
