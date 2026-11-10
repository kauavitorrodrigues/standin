import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { index, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { INTEGRATION_SERVICES } from "@standin/contracts";
import { integrationProviderEnum } from "./organization-integrations";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

export const integrationServiceEnum = pgEnum(
    "integration_service",
    INTEGRATION_SERVICES
);

// A person connected to an outside service inside an organization. A person in
// two organizations has two rows, because each organization brings its own app.
// The row is deleted, not marked, when the connection ends, so no token stays.
export const appConnectionsTable = pgTable(
    "app_connections",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        provider: integrationProviderEnum("provider").notNull(),
        service: integrationServiceEnum("service").notNull(),
        // Who the person is at the provider (for Spotify, the user id).
        accountId: text("account_id").notNull(),
        // The photo of the account at the provider, when it sends one.
        accountImageUrl: text("account_image_url"),
        refreshTokenSealed: text("refresh_token_sealed").notNull(),
        scope: text("scope").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("app_connections_organization_user_service_unique").on(
            table.organizationId,
            table.userId,
            table.provider,
            table.service
        ),
        index("app_connections_user_id_index").on(table.userId),
    ]
);

export const appConnectionsRelations = relations(
    appConnectionsTable,
    ({ one }) => ({
        organization: one(organizationsTable, {
            fields: [appConnectionsTable.organizationId],
            references: [organizationsTable.id],
        }),
        user: one(usersTable, {
            fields: [appConnectionsTable.userId],
            references: [usersTable.id],
        }),
    })
);
