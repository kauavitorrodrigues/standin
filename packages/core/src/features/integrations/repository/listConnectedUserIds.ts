import { appConnectionsTable, db } from "@standin/database";
import type { ConnectionTarget } from "../types";
import { connectionTargetIs } from "./conditions";

/** The people of an organization who hold a connection. */
export const listConnectedUserIds = async (
    target: ConnectionTarget
): Promise<string[]> => {
    const rows = await db
        .select({ userId: appConnectionsTable.userId })
        .from(appConnectionsTable)
        .where(connectionTargetIs(target));

    return rows.map((row) => row.userId);
};
