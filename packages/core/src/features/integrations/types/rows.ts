import type { appConnectionsTable } from "@standin/database";

export type AppConnectionRow = typeof appConnectionsTable.$inferSelect;

export type OrganizationIntegrationRow = {
    clientId: string;
    clientSecretSealed: string;
};

// A person who holds a connection, for the owner's list.
export type ConnectionListEntry = {
    userId: string;
    name: string;
    imageUrl: string | null;
    connectedAt: Date;
};
