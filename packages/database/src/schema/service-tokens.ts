import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ServiceTokenScope } from "@standin/contracts";
import { usersTable } from "./users";

// A credential for tools and agents. Only the SHA-256 hash of the token is
// stored, plus a short prefix to recognize it in a list. The token itself is
// shown once, when it is created, and never kept.
export const serviceTokensTable = pgTable(
    "service_tokens",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        // The admin who created it. The token acts as this user.
        createdById: text("created_by_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        name: text("name").notNull(),
        tokenHash: text("token_hash").notNull(),
        tokenPrefix: text("token_prefix").notNull(),
        scopes: jsonb("scopes").$type<ServiceTokenScope[]>().notNull(),

        // Date columns
        lastUsedAt: timestamp("last_used_at", { mode: "date" }),
        expiresAt: timestamp("expires_at", { mode: "date" }),
        revokedAt: timestamp("revoked_at", { mode: "date" }),
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("service_tokens_token_hash_unique").on(table.tokenHash),
        index("service_tokens_created_by_id_index").on(table.createdById),
    ]
);

export const serviceTokensRelations = relations(
    serviceTokensTable,
    ({ one }) => ({
        createdBy: one(usersTable, {
            fields: [serviceTokensTable.createdById],
            references: [usersTable.id],
        }),
    })
);
