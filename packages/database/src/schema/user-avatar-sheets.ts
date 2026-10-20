import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    index,
    pgTable,
    text,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { filesTable } from "./files";
import { usersTable } from "./users";

// The sheet assembled from the parts a person chose. It is derived data,
// replaced in place, so there is no `deleted_at`. The old `files` row gets a
// soft delete only after the clients had time to swap it.
export const userAvatarSheetsTable = pgTable(
    "user_avatar_sheets",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),

        // Properties columns
        // sha256 of the effective configuration that produced the sheet.
        configHash: varchar("config_hash", { length: 64 }).notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("user_avatar_sheets_user_id_unique").on(table.userId),
        index("user_avatar_sheets_file_id_index").on(table.fileId),
    ]
);

export const userAvatarSheetsRelations = relations(
    userAvatarSheetsTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userAvatarSheetsTable.userId],
            references: [usersTable.id],
        }),
        file: one(filesTable, {
            fields: [userAvatarSheetsTable.fileId],
            references: [filesTable.id],
        }),
    })
);
