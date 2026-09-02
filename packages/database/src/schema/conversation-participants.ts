import { relations, sql } from "drizzle-orm";
import { deletedAtColumn, uuidPrimaryKeyColumn } from "./common";
import {
    text,
    pgTable,
    index,
    uniqueIndex,
    timestamp,
} from "drizzle-orm/pg-core";
import { conversationsTable } from "./conversations";
import { usersTable } from "./users";

export const conversationParticipantsTable = pgTable(
    "conversation_participants",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        conversationId: text("conversation_id")
            .notNull()
            .references(() => conversationsTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Date columns
        joinedAt: timestamp("joined_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("conversation_participants_conversation_id_user_id_unique")
            .on(table.conversationId, table.userId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("conversation_participants_conversation_id_index").on(
            table.conversationId
        ),
        index("conversation_participants_user_id_index").on(table.userId),
    ]
);

export const conversationParticipantsRelations = relations(
    conversationParticipantsTable,
    ({ one }) => ({
        conversation: one(conversationsTable, {
            fields: [conversationParticipantsTable.conversationId],
            references: [conversationsTable.id],
        }),
        user: one(usersTable, {
            fields: [conversationParticipantsTable.userId],
            references: [usersTable.id],
        }),
    })
);
