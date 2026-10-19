import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    type AnyPgColumn,
    index,
    pgEnum,
    pgTable,
    text,
    unique,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { AVATAR_SLOTS } from "@standin/contracts";
import { filesTable } from "./files";
import { usersTable } from "./users";

export const avatarSlotEnum = pgEnum("avatar_slot", AVATAR_SLOTS);

// A piece of the avatar (hair, shirt, hat), global to every organization. The
// sheet and the preview are both required. A color variation is another row
// pointing at the base through `base_part_id`, with its own sheet and preview.
export const avatarPartsTable = pgTable(
    "avatar_parts",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        // Null for a base part, the base part id for a color variation.
        basePartId: text("base_part_id").references(
            (): AnyPgColumn => avatarPartsTable.id
        ),
        // The sheet drawn after the body. Can be fully transparent.
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),
        // The thumbnail shown in the part list.
        previewFileId: text("preview_file_id")
            .notNull()
            .references(() => filesTable.id),
        createdBy: text("created_by")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        key: varchar("key", { length: 100 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        slot: avatarSlotEnum("slot").notNull(),
        // Color of the row, both set or both null. The color is art content,
        // not a system enum. `colorHex` is `#RRGGBB` uppercase and only feeds
        // the swatch shown in the editor.
        colorKey: varchar("color_key", { length: 32 }),
        colorHex: varchar("color_hex", { length: 7 }),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("avatar_parts_key_unique")
            .on(table.key)
            .where(sql`${table.deletedAt} IS NULL`),
        // Target of the composite foreign key of `user_avatar_parts`, which
        // guarantees that the chosen part belongs to the slot.
        unique("avatar_parts_id_slot_unique").on(table.id, table.slot),
        // One row per color in a family. The family is the base id, or the
        // own id for a base.
        uniqueIndex("avatar_parts_family_color_unique")
            .on(
                sql`coalesce(${table.basePartId}, ${table.id})`,
                sql`coalesce(${table.colorKey}, '')`
            )
            .where(sql`${table.deletedAt} IS NULL`),
        // Keyset pagination of the base parts of a slot, one page at a time.
        index("avatar_parts_slot_name_id_index")
            .on(table.slot, table.name, table.id)
            .where(
                sql`${table.basePartId} IS NULL AND ${table.deletedAt} IS NULL`
            ),
        index("avatar_parts_base_part_id_index").on(table.basePartId),
        index("avatar_parts_slot_index").on(table.slot),
        index("avatar_parts_file_id_index").on(table.fileId),
        index("avatar_parts_preview_file_id_index").on(table.previewFileId),
        index("avatar_parts_created_by_index").on(table.createdBy),
    ]
);

export const avatarPartsRelations = relations(avatarPartsTable, ({ one }) => ({
    basePart: one(avatarPartsTable, {
        fields: [avatarPartsTable.basePartId],
        references: [avatarPartsTable.id],
        relationName: "avatarPartVariation",
    }),
    file: one(filesTable, {
        fields: [avatarPartsTable.fileId],
        references: [filesTable.id],
        relationName: "avatarPartFront",
    }),
    previewFile: one(filesTable, {
        fields: [avatarPartsTable.previewFileId],
        references: [filesTable.id],
        relationName: "avatarPartPreview",
    }),
}));
