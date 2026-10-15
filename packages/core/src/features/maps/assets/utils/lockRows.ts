import { ROW_LOCK_MODES } from "../../../../lib/consts/locks";
import { mapAssetsTable, eq } from "@standin/database";
import type { Transaction } from "@standin/database";
import { lockedRowSelect } from "../consts/select";

/**
 * Locks object rows, in id order so two operations never take the same rows
 * in opposite orders. Operations on a desk's items lock the desk row, which
 * lets different desks be edited in parallel.
 */
export const lockRows = async (tx: Transaction, rowIds: string[]) => {
    for (const id of [...new Set(rowIds)].sort()) {
        await tx
            .select(lockedRowSelect)
            .from(mapAssetsTable)
            .where(eq(mapAssetsTable.id, id))
            .for(ROW_LOCK_MODES.UPDATE);
    }
};
