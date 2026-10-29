import { db, desc, serviceTokensTable } from "@standin/database";
import type { ServiceToken } from "@standin/contracts";
import { serviceTokenSelect } from "./columns";

export const listServiceTokens = async (): Promise<ServiceToken[]> =>
    db
        .select(serviceTokenSelect)
        .from(serviceTokensTable)
        .orderBy(desc(serviceTokensTable.createdAt));
