import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { INTEGRATION_PROVIDERS } from "@standin/contracts";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

export const integrationProviderEnum = pgEnum(
    "integration_provider",
    INTEGRATION_PROVIDERS
);

// The app of an outside service that an organization brings, made by its owner
// (for Spotify, an app of the developer dashboard). One per provider. The
// secret is sealed, never kept as text.
export const organizationIntegrationsTable = pgTable(
    "organization_integrations",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        // The owner who saved the credentials last.
        updatedById: text("updated_by_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        provider: integrationProviderEnum("provider").notNull(),
        clientId: text("client_id").notNull(),
        clientSecretSealed: text("client_secret_sealed").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex(
            "organization_integrations_organization_provider_unique"
        ).on(table.organizationId, table.provider),
    ]
);

export const organizationIntegrationsRelations = relations(
    organizationIntegrationsTable,
    ({ one }) => ({
        organization: one(organizationsTable, {
            fields: [organizationIntegrationsTable.organizationId],
            references: [organizationsTable.id],
        }),
        updatedBy: one(usersTable, {
            fields: [organizationIntegrationsTable.updatedById],
            references: [usersTable.id],
        }),
    })
);
