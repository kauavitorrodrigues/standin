import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    editedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, pgTable, index, boolean, type AnyPgColumn } from "drizzle-orm/pg-core";
import { conversationsTable } from "./conversations";
import { usersTable } from "./users";
import { messageAttachmentsTable } from "./message-attachments";
import { messageReactionsTable } from "./message-reactions";
import { messageReadsTable } from "./message-reads";

export const messagesTable = pgTable(
    "messages",
    {
        id: uuidPrimaryKeyColumn(),

        conversationId: text("conversation_id")
            .notNull()
            .references(() => conversationsTable.id),
        senderId: text("sender_id")
            .notNull()
            .references(() => usersTable.id),

        // Nullable. A message can be attachment-only, with no text at all.
        content: text("content"),

        // Null for a top-level message. A reply points at a top-level parent, and
        // the service rejects a parent that is itself a reply (no nested
        // threads).
        threadParentId: text("thread_parent_id").references(
            (): AnyPgColumn => messagesTable.id
        ),
        // A reply may also show in the main conversation list.
        showThreadReplyInChannel: boolean("show_thread_reply_in_channel")
            .notNull()
            .default(false),

        createdAt: createdAtColumn(),
        // Set by the service only on a real edit of `content`, not updatedAtColumn().
        editedAt: editedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("messages_conversation_id_created_at_index").on(
            table.conversationId,
            table.createdAt
        ),
        index("messages_sender_id_index").on(table.senderId),
        index("messages_thread_parent_id_index").on(table.threadParentId),
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
    reads: many(messageReadsTable),
}));
