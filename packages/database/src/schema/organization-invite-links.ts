import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

// A link that creates an account straight inside an organization, even when
// public sign up is closed. Not the same as `organization_invites` (by e-mail)
// or the guest links of a space.
export const organizationInviteLinksTable = pgTable(
    "organization_invite_links",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        createdBy: text("created_by").references(() => usersTable.id),

        // Properties columns
        // Only the SHA-256 of the token is kept. The token is shown once, when
        // the link is created.
        tokenHash: text("token_hash").notNull(),
        // The role of the new member. Never the admin role.
        role: text("role").notNull().default("MEMBER"),
        expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
        maxUses: integer("max_uses"),
        usesCount: integer("uses_count").notNull().default(0),
        revokedAt: timestamp("revoked_at", { mode: "date" }),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("organization_invite_links_token_hash_unique")
            .on(table.tokenHash)
            .where(sql`${table.deletedAt} IS NULL`),
        index("organization_invite_links_organization_id_index").on(
            table.organizationId
        ),
    ]
);

export const organizationInviteLinksRelations = relations(
    organizationInviteLinksTable,
    ({ one }) => ({
        organization: one(organizationsTable, {
            fields: [organizationInviteLinksTable.organizationId],
            references: [organizationsTable.id],
        }),
        creator: one(usersTable, {
            fields: [organizationInviteLinksTable.createdBy],
            references: [usersTable.id],
        }),
    })
);
