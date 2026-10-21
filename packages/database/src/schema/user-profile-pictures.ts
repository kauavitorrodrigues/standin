import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { filesTable } from "./files";
import { usersTable } from "./users";

// The profile picture of a person. One row per user, replaced in place, so
// there is no `deleted_at`. The old `files` row gets a soft delete on the swap.
// The database keeps no URL: the API builds it from the file id.
export const userProfilePicturesTable = pgTable(
    "user_profile_pictures",
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

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("user_profile_pictures_user_id_unique").on(table.userId),
        index("user_profile_pictures_file_id_index").on(table.fileId),
    ]
);

export const userProfilePicturesRelations = relations(
    userProfilePicturesTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userProfilePicturesTable.userId],
            references: [usersTable.id],
        }),
        file: one(filesTable, {
            fields: [userProfilePicturesTable.fileId],
            references: [filesTable.id],
        }),
    })
);
