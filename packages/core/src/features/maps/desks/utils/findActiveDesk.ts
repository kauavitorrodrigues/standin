import { deskAssignmentsTable, and, eq, isNull } from "@standin/database";
import type { DbExecutor } from "../../../../lib/types";
import { deskRowSelect } from "../consts/select";
import type { DeskFilter } from "../types/desk-filter";

export const findActiveDesk = async (tx: DbExecutor, filter: DeskFilter) => {
    const [row] = await tx
        .select(deskRowSelect)
        .from(deskAssignmentsTable)
        .where(
            and(
                isNull(deskAssignmentsTable.deletedAt),
                filter.mapAssetId
                    ? eq(deskAssignmentsTable.mapAssetId, filter.mapAssetId)
                    : undefined,
                filter.spaceId
                    ? eq(deskAssignmentsTable.spaceId, filter.spaceId)
                    : undefined,
                filter.userId
                    ? eq(deskAssignmentsTable.userId, filter.userId)
                    : undefined
            )
        );

    return row ?? null;
};
