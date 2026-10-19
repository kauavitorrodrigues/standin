import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    foreignKey,
    index,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { avatarPartsTable, avatarSlotEnum } from "./avatar-parts";
import { usersTable } from "./users";

// What a person chose for each slot of the avatar. The color is the part
// itself, since each color variation is its own row of `avatar_parts`. Removing a choice deletes
// the row and changing it updates the row, so there is no `deleted_at`.
export const userAvatarPartsTable = pgTable(
    "user_avatar_parts",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        partId: text("part_id").notNull(),

        // Properties columns
        slot: avatarSlotEnum("slot").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        // One choice per slot per person.
        uniqueIndex("user_avatar_parts_user_id_slot_unique").on(
            table.userId,
            table.slot
        ),
        index("user_avatar_parts_part_id_index").on(table.partId),
        // The part must belong to the slot of the choice.
        foreignKey({
            name: "user_avatar_parts_part_id_slot_fk",
            columns: [table.partId, table.slot],
            foreignColumns: [avatarPartsTable.id, avatarPartsTable.slot],
        }),
    ]
);

export const userAvatarPartsRelations = relations(
    userAvatarPartsTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userAvatarPartsTable.userId],
            references: [usersTable.id],
        }),
        part: one(avatarPartsTable, {
            fields: [userAvatarPartsTable.partId],
            references: [avatarPartsTable.id],
        }),
    })
);
