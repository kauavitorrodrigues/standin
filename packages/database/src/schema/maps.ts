import { relations } from "drizzle-orm";
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
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";
import { filesTable } from "./files";

export const mapsTable = pgTable(
    "maps",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        width: integer("width").notNull(),
        height: integer("height").notNull(),
        tileSize: integer("tile_size").notNull(),

        // Relations columns
        organizationId: text("organization_id").references(
            () => organizationsTable.id,
        ),
        mapJsonFileId: text("map_json_file_id")
            .notNull()
            .references(() => filesTable.id),
        thumbnailFileId: text("thumbnail_file_id").references(
            () => filesTable.id,
        ),
        createdBy: text("created_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("maps_organization_id_index").on(table.organizationId),
        index("maps_map_json_file_id_index").on(table.mapJsonFileId),
    ],
);

export const mapsRelations = relations(mapsTable, ({ one }) => ({
    creator: one(usersTable, {
        fields: [mapsTable.createdBy],
        references: [usersTable.id],
    }),
}));

export const mapTilesetsTable = pgTable(
    "map_tilesets",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        mapId: text("map_id")
            .notNull()
            .references(() => mapsTable.id),
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),

        // Properties columns
        tilesetName: varchar("tileset_name", { length: 255 }).notNull(),

        // Date columns
        createdAt: createdAtColumn(),
    },
    (table) => [
        index("map_tilesets_map_id_index").on(table.mapId),
        index("map_tilesets_file_id_index").on(table.fileId),
        // Guarantees the JSON <-> tileset name matching stays unique per map
        uniqueIndex("map_tilesets_map_id_tileset_name_unique").on(
            table.mapId,
            table.tilesetName,
        ),
    ],
);
