import { db, eq, serviceTokensTable } from "@standin/database";
import type { ServiceToken } from "@standin/contracts";
import { serviceTokenSelect } from "./columns";

export const revokeServiceToken = async (
    id: string,
    revokedAt: Date
): Promise<ServiceToken | null> => {
    const [row] = await db
        .update(serviceTokensTable)
        .set({ revokedAt })
        .where(eq(serviceTokensTable.id, id))
        .returning(serviceTokenSelect);
    return row ?? null;
};
