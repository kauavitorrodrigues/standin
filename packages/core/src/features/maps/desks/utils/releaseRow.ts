import { deskAssignmentsTable, eq } from "@standin/database";
import type { Transaction } from "@standin/database";

export const releaseRow = async (tx: Transaction, deskRowId: string) => {
    await tx
        .update(deskAssignmentsTable)
        .set({ deletedAt: new Date() })
        .where(eq(deskAssignmentsTable.id, deskRowId));
};
