import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    boolean,
    index,
    pgEnum,
    pgTable,
    text,
    unique,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import { filesTable } from "./files";
import { usersTable } from "./users";

export const avatarBaseKindEnum = pgEnum("avatar_base_kind", AVATAR_BASE_KINDS);

// The blank avatars. A BODY is the one every part is drawn on and the one a
// person with no parts wears. A MANNEQUIN is the unclothed figure the admin
// dresses to preview a part, never chosen by a person. Registered by an admin
// and global to every organization. The one flagged as default is the active
// one of its kind: for a BODY it is used by people who never chose a base.
export const avatarBasesTable = pgTable(
    "avatar_bases",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        // The sprite sheet of the blank avatar.
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),
        // The image shown in lists. Null means no image.
        previewFileId: text("preview_file_id").references(() => filesTable.id),
        createdBy: text("created_by")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        key: varchar("key", { length: 100 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        kind: avatarBaseKindEnum("kind").notNull().default("BODY"),
        isDefault: boolean("is_default").notNull().default(false),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("avatar_bases_key_unique")
            .on(table.key)
            .where(sql`${table.deletedAt} IS NULL`),
        // At most one default among the active bases of each kind.
        uniqueIndex("avatar_bases_default_unique")
            .on(table.kind)
            .where(sql`${table.isDefault} AND ${table.deletedAt} IS NULL`),
        // Target of the composite foreign key of `user_avatar_bases`, which
        // guarantees that the chosen base is a BODY.
        unique("avatar_bases_id_kind_unique").on(table.id, table.kind),
        index("avatar_bases_file_id_index").on(table.fileId),
        index("avatar_bases_preview_file_id_index").on(table.previewFileId),
        index("avatar_bases_created_by_index").on(table.createdBy),
    ]
);

export const avatarBasesRelations = relations(avatarBasesTable, ({ one }) => ({
    file: one(filesTable, {
        fields: [avatarBasesTable.fileId],
        references: [filesTable.id],
        relationName: "avatarBaseSheet",
    }),
    previewFile: one(filesTable, {
        fields: [avatarBasesTable.previewFileId],
        references: [filesTable.id],
        relationName: "avatarBasePreview",
    }),
}));
