import { areasTable, and, eq, isNull } from "@standin/database";

/** Live areas of one scope: the global library (null) or one organization's. */
export const liveAreaInScope = (organizationId: string | null) =>
    and(
        isNull(areasTable.deletedAt),
        organizationId === null
            ? isNull(areasTable.organizationId)
            : eq(areasTable.organizationId, organizationId)
    );
