import { relations, sql } from "drizzle-orm";
import { createdAtColumn, deletedAtColumn, uuidPrimaryKeyColumn } from "./common";
import {
    text,
    varchar,
    pgTable,
    index,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { spacesTable } from "./spaces";
import { usersTable } from "./users";

export const organizationInvitesTable = pgTable(
    "organization_invites",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        createdBy: text("created_by").references(() => usersTable.id),
        // The desk kept for the person: it is given when they join.
        spaceId: text("space_id").references(() => spacesTable.id),
        mapAssetId: text("map_asset_id"),

        // Properties columns
        email: varchar("email", { length: 255 }).notNull(),
        // Like the links: the SHA-256 finds the invitation, and the sealed token
        // lets the owner copy the link again.
        tokenHash: text("token_hash").notNull(),
        tokenEncrypted: text("token_encrypted").notNull(),
        expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
        acceptedAt: timestamp("accepted_at", { mode: "date" }),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("organization_invites_token_hash_unique")
            .on(table.tokenHash)
            .where(sql`${table.deletedAt} IS NULL`),
        uniqueIndex("organization_invites_organization_id_email_unique")
            .on(table.organizationId, table.email)
            .where(sql`${table.deletedAt} IS NULL`),
        index("organization_invites_email_index").on(table.email),
    ],
);

export const organizationInvitesRelations = relations(
    organizationInvitesTable,
    ({ one }) => ({
        creator: one(usersTable, {
            fields: [organizationInvitesTable.createdBy],
            references: [usersTable.id],
        }),
    }),
);
