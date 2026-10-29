import { db, serviceTokensTable } from "@standin/database";
import type { ServiceToken } from "@standin/contracts";
import type { InsertServiceTokenInput } from "../types";
import { serviceTokenSelect } from "./columns";

export const createServiceToken = async (
    input: InsertServiceTokenInput
): Promise<ServiceToken> => {
    const [row] = await db
        .insert(serviceTokensTable)
        .values({ ...input, expiresAt: input.expiresAt ?? null })
        .returning(serviceTokenSelect);
    return row;
};
