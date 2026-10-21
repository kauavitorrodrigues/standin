import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { index, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { OAUTH_PROVIDERS } from "@standin/contracts";
import { usersTable } from "./users";

export const oauthProviderEnum = pgEnum("oauth_provider", OAUTH_PROVIDERS);

// The account a person has at a login provider. The provider id is kept as the
// numeric id of the provider (as text), never the login, because the login can
// change. No token of the provider is stored.
export const userIdentitiesTable = pgTable(
    "user_identities",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        provider: oauthProviderEnum("provider").notNull(),
        providerUserId: text("provider_user_id").notNull(),
        // Informative only, it may be outdated.
        providerLogin: text("provider_login").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("user_identities_provider_user_unique").on(
            table.provider,
            table.providerUserId
        ),
        index("user_identities_user_id_index").on(table.userId),
    ]
);

export const userIdentitiesRelations = relations(
    userIdentitiesTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userIdentitiesTable.userId],
            references: [usersTable.id],
        }),
    })
);
