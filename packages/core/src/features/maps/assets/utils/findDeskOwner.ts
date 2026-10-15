import { deskAssignmentsTable, and, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { deskOwnerSelect } from "../consts/select";
import type { DeskOwner } from "../types/desk-owner";

/** Is `rowId` a desk someone currently owns? */
export const findDeskOwner = async (
    tx: Transaction,
    rowId: string
): Promise<DeskOwner | null> => {
    const [desk] = await tx
        .select(deskOwnerSelect)
        .from(deskAssignmentsTable)
        .where(
            and(
                eq(deskAssignmentsTable.mapAssetId, rowId),
                isNull(deskAssignmentsTable.deletedAt)
            )
        );

    return desk ?? null;
};
