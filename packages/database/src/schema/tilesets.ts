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
import type { TileMeta } from "@standin/contracts";
import { filesTable } from "./files";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

// A library tileset: a PNG sheet on a 32 px grid. Global when
// `organization_id` is null, private to an organization otherwise.
export const tilesetsTable = pgTable(
    "tilesets",
    {
        // Primary key column. Also the tileset name inside a map layout.
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        organizationId: text("organization_id").references(
            () => organizationsTable.id
        ),
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),
        createdBy: text("created_by")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        // Used by the idempotent seed.
        key: varchar("key", { length: 100 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        widthPx: integer("width_px").notNull(),
        heightPx: integer("height_px").notNull(),
        columns: integer("columns").notNull(),
        tileCount: integer("tile_count").notNull(),
        margin: integer("margin").notNull().default(0),
        spacing: integer("spacing").notNull().default(0),
        // Category, solid and wall top per tile.
        tileMeta: jsonb("tile_meta").$type<TileMeta>(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("tilesets_key_global_unique")
            .on(table.key)
            .where(
                sql`${table.organizationId} IS NULL AND ${table.deletedAt} IS NULL`
            ),
        uniqueIndex("tilesets_organization_id_key_unique")
            .on(table.organizationId, table.key)
            .where(
                sql`${table.organizationId} IS NOT NULL AND ${table.deletedAt} IS NULL`
            ),
        index("tilesets_organization_id_index").on(table.organizationId),
        index("tilesets_file_id_index").on(table.fileId),
    ]
);

export const tilesetsRelations = relations(tilesetsTable, ({ one }) => ({
    file: one(filesTable, {
        fields: [tilesetsTable.fileId],
        references: [filesTable.id],
    }),
}));
