import { sql } from "drizzle-orm";
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

export const organizationInvitesTable = pgTable(
    "organization_invites",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),

        // Properties columns
        email: varchar("email", { length: 255 }).notNull(),
        token: text("token").notNull(),
        expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("organization_invites_token_unique")
            .on(table.token)
            .where(sql`${table.deletedAt} IS NULL`),
        uniqueIndex("organization_invites_organization_id_email_unique")
            .on(table.organizationId, table.email)
            .where(sql`${table.deletedAt} IS NULL`),
        index("organization_invites_email_index").on(table.email),
    ],
);
