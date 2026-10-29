import { db, eq, serviceTokensTable } from "@standin/database";
import type { ServiceToken } from "@standin/contracts";
import { serviceTokenSelect } from "./columns";

export const findServiceTokenByHash = async (
    tokenHash: string
): Promise<ServiceToken | null> => {
    const [row] = await db
        .select(serviceTokenSelect)
        .from(serviceTokensTable)
        .where(eq(serviceTokensTable.tokenHash, tokenHash))
        .limit(1);
    return row ?? null;
};
