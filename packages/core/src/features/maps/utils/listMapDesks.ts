import { db, deskAssignmentsTable, and, eq, isNull } from "@standin/database";
import { MAP_OWNER_KINDS } from "../consts/owner";
import { mapDeskSelect } from "../consts/select";
import type { MapAccess } from "../types/map-access";

// Template maps have no space, so no desk owners.
export const listMapDesks = async (access: MapAccess) => {
    if (access.owner.kind !== MAP_OWNER_KINDS.SPACE) return [];

    return db
        .select(mapDeskSelect)
        .from(deskAssignmentsTable)
        .where(
            and(
                eq(deskAssignmentsTable.spaceId, access.owner.spaceId),
                isNull(deskAssignmentsTable.deletedAt)
            )
        );
};
