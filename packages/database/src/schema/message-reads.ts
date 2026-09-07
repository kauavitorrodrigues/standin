import { relations } from "drizzle-orm";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { text, pgTable, index, uniqueIndex } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";
import { usersTable } from "./users";

export const messageReadsTable = pgTable(
    "message_reads",
    {
        id: uuidPrimaryKeyColumn(),

        messageId: text("message_id")
            .notNull()
            .references(() => messagesTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Doubles as readAt. Set once, never updated: "seen" isn't a state
        // that gets undone, unlike a reaction.
        createdAt: createdAtColumn(),
    },
    (table) => [
        // A person only "sees" a message once. Reopening the thread is a
        // no-op (ON CONFLICT DO NOTHING on insert), not a duplicate row.
        uniqueIndex("message_reads_message_id_user_id_unique").on(
            table.messageId,
            table.userId
        ),
        index("message_reads_user_id_index").on(table.userId),
    ]
);

export const messageReadsRelations = relations(
    messageReadsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [messageReadsTable.messageId],
            references: [messagesTable.id],
        }),
        user: one(usersTable, {
            fields: [messageReadsTable.userId],
            references: [usersTable.id],
        }),
    })
);
