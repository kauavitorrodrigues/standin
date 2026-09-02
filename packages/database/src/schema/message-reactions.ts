import { relations } from "drizzle-orm";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { text, varchar, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";
import { usersTable } from "./users";

export const messageReactionsTable = pgTable(
    "message_reactions",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        messageId: text("message_id")
            .notNull()
            .references(() => messagesTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        emoji: varchar("emoji", { length: 32 }).notNull(),

        // Date columns
        createdAt: createdAtColumn(),
    },
    (table) => [
        // Same person can react with different emojis on the same message, but not repeat the same emoji.
        uniqueIndex("message_reactions_message_id_user_id_emoji_unique").on(
            table.messageId,
            table.userId,
            table.emoji
        ),
    ]
);

export const messageReactionsRelations = relations(
    messageReactionsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [messageReactionsTable.messageId],
            references: [messagesTable.id],
        }),
        user: one(usersTable, {
            fields: [messageReactionsTable.userId],
            references: [usersTable.id],
        }),
    })
);
