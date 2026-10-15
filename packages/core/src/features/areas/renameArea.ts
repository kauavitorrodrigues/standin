import { db, areasTable, eq } from "@standin/database";
import {
    AreaBodySchema,
    AreaNameInvalidIssue,
    AreaValidationError,
} from "@standin/contracts";
import type { AreaSummary } from "@standin/contracts";
import { findScopedArea } from "./utils/findArea";
import { toAreaSummary } from "./utils/toAreaSummary";

/** Renames an area. `updated_at` moves, so the palette version moves with it. */
export const renameArea = async (
    id: string,
    organizationId: string | null,
    name: unknown
): Promise<AreaSummary> => {
    await findScopedArea(id, organizationId);
    const parsed = AreaBodySchema.shape.name.safeParse(name);
    if (!parsed.success) {
        throw new AreaValidationError([new AreaNameInvalidIssue()]);
    }
    await db
        .update(areasTable)
        .set({ name: parsed.data, updatedAt: new Date() })
        .where(eq(areasTable.id, id));
    return toAreaSummary(await findScopedArea(id, organizationId));
};
