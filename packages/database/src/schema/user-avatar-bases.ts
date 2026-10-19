import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    check,
    foreignKey,
    index,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { avatarBaseKindEnum, avatarBasesTable } from "./avatar-bases";
import { usersTable } from "./users";

// The blank avatar a person chose. Without a row, the default base is used.
// Changing the choice updates the row, so there is no `deleted_at`.
export const userAvatarBasesTable = pgTable(
    "user_avatar_bases",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        baseId: text("base_id").notNull(),

        // Properties columns
        // Always BODY. It exists so the foreign key below can refuse a
        // mannequin as the base of a person.
        kind: avatarBaseKindEnum("kind").notNull().default("BODY"),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (table) => [
        uniqueIndex("user_avatar_bases_user_id_unique").on(table.userId),
        index("user_avatar_bases_base_id_index").on(table.baseId),
        check("user_avatar_bases_kind_body", sql`${table.kind} = 'BODY'`),
        // The base must be a BODY.
        foreignKey({
            name: "user_avatar_bases_base_id_kind_fk",
            columns: [table.baseId, table.kind],
            foreignColumns: [avatarBasesTable.id, avatarBasesTable.kind],
        }),
    ]
);

export const userAvatarBasesRelations = relations(
    userAvatarBasesTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userAvatarBasesTable.userId],
            references: [usersTable.id],
        }),
        base: one(avatarBasesTable, {
            fields: [userAvatarBasesTable.baseId],
            references: [avatarBasesTable.id],
        }),
    })
);
