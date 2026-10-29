import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    text,
    varchar,
    integer,
    jsonb,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Stamp } from "@standin/contracts";
import { filesTable } from "./files";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

// A reusable block of map (tiles, objects and an optional zone) that the map
// editor places whole. The stamp holds tileset and asset ids with no foreign
// key, like `maps.layout`. `updated_at` is the version of the area.
export const areasTable = pgTable(
    "areas",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        // Identity of a library seed. Null for an area made in the editor.
        key: varchar("key", { length: 100 }),
        name: varchar("name", { length: 60 }).notNull(),
        // In tiles. Equal to the stamp, and fixed after creation.
        width: integer("width").notNull(),
        height: integer("height").notNull(),
        // Denormalized from the stamp for the list.
        objectCount: integer("object_count").notNull(),
        stamp: jsonb("stamp").$type<Stamp>().notNull(),

        // Relations columns
        // Null for a global area. Organization areas are not built yet.
        organizationId: text("organization_id").references(
            () => organizationsTable.id
        ),
        thumbnailFileId: text("thumbnail_file_id")
            .notNull()
            .references(() => filesTable.id),
        createdBy: text("created_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("areas_key_global_unique")
            .on(table.key)
            .where(
                sql`${table.organizationId} IS NULL AND ${table.deletedAt} IS NULL`
            ),
        uniqueIndex("areas_organization_id_key_unique")
            .on(table.organizationId, table.key)
            .where(
                sql`${table.organizationId} IS NOT NULL AND ${table.deletedAt} IS NULL`
            ),
        index("areas_organization_id_index").on(table.organizationId),
        index("areas_created_by_index").on(table.createdBy),
        index("areas_thumbnail_file_id_index").on(table.thumbnailFileId),
    ]
);

export const areasRelations = relations(areasTable, ({ one }) => ({
    thumbnail: one(filesTable, {
        fields: [areasTable.thumbnailFileId],
        references: [filesTable.id],
    }),
    creator: one(usersTable, {
        fields: [areasTable.createdBy],
        references: [usersTable.id],
    }),
    organization: one(organizationsTable, {
        fields: [areasTable.organizationId],
        references: [organizationsTable.id],
    }),
}));
