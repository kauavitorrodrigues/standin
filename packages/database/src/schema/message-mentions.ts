import { relations } from "drizzle-orm";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { text, pgTable, uniqueIndex, index } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";
import { usersTable } from "./users";

// The people a message mentions. The content keeps the link; this table is
// what the server trusts, and what tells an edit who was added.
export const messageMentionsTable = pgTable(
    "message_mentions",
    {
        id: uuidPrimaryKeyColumn(),

        messageId: text("message_id")
            .notNull()
            .references(() => messagesTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        createdAt: createdAtColumn(),
    },
    (table) => [
        uniqueIndex("message_mentions_message_id_user_id_unique").on(
            table.messageId,
            table.userId
        ),
        index("message_mentions_user_id_index").on(table.userId),
    ]
);

export const messageMentionsRelations = relations(
    messageMentionsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [messageMentionsTable.messageId],
            references: [messagesTable.id],
        }),
        user: one(usersTable, {
            fields: [messageMentionsTable.userId],
            references: [usersTable.id],
        }),
    })
);
