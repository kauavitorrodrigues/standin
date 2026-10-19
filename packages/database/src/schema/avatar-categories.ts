import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    index,
    integer,
    pgTable,
    text,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { avatarSlotEnum } from "./avatar-parts";
import { filesTable } from "./files";

// One row per slot of the avatar, with the name and the image shown in the
// editor list. The rows are created by the migration and an admin only edits
// them, so there is no `deleted_at`.
export const avatarCategoriesTable = pgTable(
    "avatar_categories",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        // The image shown beside the name. Null means no image.
        previewFileId: text("preview_file_id").references(() => filesTable.id),

        // Properties columns
        slot: avatarSlotEnum("slot").notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        sortOrder: integer("sort_order").notNull().default(0),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("avatar_categories_slot_unique").on(table.slot),
        index("avatar_categories_preview_file_id_index").on(
            table.previewFileId
        ),
    ]
);

export const avatarCategoriesRelations = relations(
    avatarCategoriesTable,
    ({ one }) => ({
        previewFile: one(filesTable, {
            fields: [avatarCategoriesTable.previewFileId],
            references: [filesTable.id],
        }),
    })
);
