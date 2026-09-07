import { relations } from "drizzle-orm";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { text, timestamp, pgTable, index, uniqueIndex } from "drizzle-orm/pg-core";
import { conversationsTable } from "./conversations";
import { usersTable } from "./users";

export const conversationReadsTable = pgTable(
    "conversation_reads",
    {
        id: uuidPrimaryKeyColumn(),

        conversationId: text("conversation_id")
            .notNull()
            .references(() => conversationsTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Every message with createdAt <= lastReadAt in this conversation
        // counts as read for this user. Only ever moves forward.
        lastReadAt: timestamp("last_read_at", { mode: "date" }).notNull(),

        createdAt: createdAtColumn(),
    },
    (table) => [
        uniqueIndex("conversation_reads_conversation_id_user_id_unique").on(
            table.conversationId,
            table.userId
        ),
        index("conversation_reads_user_id_index").on(table.userId),
    ]
);

export const conversationReadsRelations = relations(
    conversationReadsTable,
    ({ one }) => ({
        conversation: one(conversationsTable, {
            fields: [conversationReadsTable.conversationId],
            references: [conversationsTable.id],
        }),
        user: one(usersTable, {
            fields: [conversationReadsTable.userId],
            references: [usersTable.id],
        }),
    })
);
