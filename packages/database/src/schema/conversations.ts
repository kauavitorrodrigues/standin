import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, pgEnum, pgTable, index, uniqueIndex } from "drizzle-orm/pg-core";
import { CONVERSATION_TYPES } from "@standin/contracts";
import { spacesTable } from "./spaces";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";
import { conversationParticipantsTable } from "./conversation-participants";
import { messagesTable } from "./messages";

export const conversationTypeEnum = pgEnum(
    "conversation_type",
    CONVERSATION_TYPES
);

export const conversationsTable = pgTable(
    "conversations",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        type: conversationTypeEnum("type").notNull(),

        // Relations columns
        // Scopes every conversation (SPACE and DIRECT) to an organization — DMs never
        // cross organization boundaries, even between the same pair/group of users.
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        // Only populated when type = SPACE; invariant validated in the application.
        spaceId: text("space_id").references(() => spacesTable.id),
        // Nullable — not applicable to SPACE conversations (auto-created, no human author).
        createdBy: text("created_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("conversations_space_id_unique")
            .on(table.spaceId)
            .where(sql`${table.type} = 'SPACE' AND ${table.deletedAt} IS NULL`),
        index("conversations_space_id_index").on(table.spaceId),
        index("conversations_created_by_index").on(table.createdBy),
        index("conversations_organization_id_index").on(table.organizationId),
    ]
);

export const conversationsRelations = relations(
    conversationsTable,
    ({ one, many }) => ({
        organization: one(organizationsTable, {
            fields: [conversationsTable.organizationId],
            references: [organizationsTable.id],
        }),
        space: one(spacesTable, {
            fields: [conversationsTable.spaceId],
            references: [spacesTable.id],
        }),
        creator: one(usersTable, {
            fields: [conversationsTable.createdBy],
            references: [usersTable.id],
        }),
        participants: many(conversationParticipantsTable),
        messages: many(messagesTable),
    })
);
