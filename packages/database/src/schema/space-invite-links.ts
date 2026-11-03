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
    varchar,
} from "drizzle-orm/pg-core";
import { spacesTable } from "./spaces";
import { usersTable } from "./users";

export const spaceInviteLinksTable = pgTable(
    "space_invite_links",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        spaceId: text("space_id")
            .notNull()
            .references(() => spacesTable.id),
        createdBy: text("created_by").references(() => usersTable.id),

        // Properties columns
        // Only the SHA-256 of the token is kept. The token itself is shown once,
        // when the link is created.
        tokenHash: text("token_hash").notNull(),
        // The fixed guest link of the space keeps its token encrypted so the
        // hosts can copy it again. Null for the one-off links made before.
        tokenEncrypted: text("token_encrypted"),
        // How long an admitted guest of this link keeps the access. Null means
        // until a host sends them out.
        guestValidityHours: integer("guest_validity_hours"),
        // Reserved for the invite by email: when set, only that account may
        // use the link. Nothing fills it yet.
        email: varchar("email", { length: 255 }),
        expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
        maxUses: integer("max_uses"),
        usesCount: integer("uses_count").notNull().default(0),
        revokedAt: timestamp("revoked_at", { mode: "date" }),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("space_invite_links_token_hash_unique")
            .on(table.tokenHash)
            .where(sql`${table.deletedAt} IS NULL`),
        // One fixed link alive per space: a reset closes it first.
        uniqueIndex("space_invite_links_fixed_unique")
            .on(table.spaceId)
            .where(
                sql`${table.deletedAt} IS NULL AND ${table.revokedAt} IS NULL AND ${table.tokenEncrypted} IS NOT NULL`
            ),
        index("space_invite_links_space_id_index").on(table.spaceId),
    ]
);

export const spaceInviteLinksRelations = relations(
    spaceInviteLinksTable,
    ({ one }) => ({
        space: one(spacesTable, {
            fields: [spaceInviteLinksTable.spaceId],
            references: [spacesTable.id],
        }),
        creator: one(usersTable, {
            fields: [spaceInviteLinksTable.createdBy],
            references: [usersTable.id],
        }),
    })
);
