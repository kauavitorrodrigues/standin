import { relations } from "drizzle-orm";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { text, pgTable, index } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages";
import { filesTable } from "./files";

export const messageAttachmentsTable = pgTable(
    "message_attachments",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        messageId: text("message_id")
            .notNull()
            .references(() => messagesTable.id),
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),

        // Date columns
        createdAt: createdAtColumn(),
    },
    (table) => [
        index("message_attachments_message_id_index").on(table.messageId),
        index("message_attachments_file_id_index").on(table.fileId),
    ]
);

export const messageAttachmentsRelations = relations(
    messageAttachmentsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [messageAttachmentsTable.messageId],
            references: [messagesTable.id],
        }),
        file: one(filesTable, {
            fields: [messageAttachmentsTable.fileId],
            references: [filesTable.id],
        }),
    })
);
