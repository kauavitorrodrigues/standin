import {
    db,
    appConnectionsTable,
    usersTable,
    asc,
    eq,
} from "@standin/database";
import type { ConnectionListEntry, ConnectionTarget } from "../types";
import { connectionTargetIs } from "./conditions";

/** Who holds a connection of the target, oldest first. */
export const listConnections = async (
    target: ConnectionTarget
): Promise<ConnectionListEntry[]> =>
    db
        .select({
            userId: appConnectionsTable.userId,
            name: usersTable.name,
            imageUrl: appConnectionsTable.accountImageUrl,
            connectedAt: appConnectionsTable.createdAt,
        })
        .from(appConnectionsTable)
        .innerJoin(usersTable, eq(usersTable.id, appConnectionsTable.userId))
        .where(connectionTargetIs(target))
        .orderBy(asc(appConnectionsTable.createdAt));
