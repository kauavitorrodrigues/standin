import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    editedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, pgTable, index } from "drizzle-orm/pg-core";
import { conversationsTable } from "./conversations";
import { usersTable } from "./users";
import { messageAttachmentsTable } from "./message-attachments";
import { messageReactionsTable } from "./message-reactions";

export const messagesTable = pgTable(
    "messages",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        conversationId: text("conversation_id")
            .notNull()
            .references(() => conversationsTable.id),
        senderId: text("sender_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        content: text("content").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        // Set by the service only on a real edit of `content` — not updatedAtColumn().
        editedAt: editedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("messages_conversation_id_created_at_index").on(
            table.conversationId,
            table.createdAt
        ),
        index("messages_sender_id_index").on(table.senderId),
    ]
);

export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
    conversation: one(conversationsTable, {
        fields: [messagesTable.conversationId],
        references: [conversationsTable.id],
    }),
    sender: one(usersTable, {
        fields: [messagesTable.senderId],
        references: [usersTable.id],
    }),
    attachments: many(messageAttachmentsTable),
    reactions: many(messageReactionsTable),
}));
