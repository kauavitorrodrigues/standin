import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, pgTable, uniqueIndex, index } from "drizzle-orm/pg-core";
import { mapAssetsTable } from "./map-assets";
import { spacesTable } from "./spaces";
import { usersTable } from "./users";

// Links a desk to a user. A row only exists while someone has the desk, a
// free desk is a DESK instance with no active row. That the desk belongs to
// the space's map is validated in the application.
export const deskAssignmentsTable = pgTable(
    "desk_assignments",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        spaceId: text("space_id")
            .notNull()
            .references(() => spacesTable.id),
        mapAssetId: text("map_asset_id")
            .notNull()
            .references(() => mapAssetsTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        // Null when the person claimed the desk themselves.
        assignedBy: text("assigned_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        // One person per desk.
        uniqueIndex("desk_assignments_map_asset_id_unique")
            .on(table.mapAssetId)
            .where(sql`${table.deletedAt} IS NULL`),
        // One desk per person per space.
        uniqueIndex("desk_assignments_space_id_user_id_unique")
            .on(table.spaceId, table.userId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("desk_assignments_user_id_index").on(table.userId),
    ],
);

export const deskAssignmentsRelations = relations(deskAssignmentsTable, ({ one }) => ({
    space: one(spacesTable, {
        fields: [deskAssignmentsTable.spaceId],
        references: [spacesTable.id],
    }),
    mapAsset: one(mapAssetsTable, {
        fields: [deskAssignmentsTable.mapAssetId],
        references: [mapAssetsTable.id],
    }),
    user: one(usersTable, {
        fields: [deskAssignmentsTable.userId],
        references: [usersTable.id],
    }),
}));
