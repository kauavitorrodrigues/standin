import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    integer,
    jsonb,
    pgEnum,
    pgTable,
    index,
} from "drizzle-orm/pg-core";
import { MAP_SIZE_TIERS, TILE_SIZE } from "@standin/contracts";
import type { MapLayout } from "@standin/contracts";
import { mapAssetsTable } from "./map-assets";

export const mapSizeTierEnum = pgEnum("map_size_tier", MAP_SIZE_TIERS);

// A map belongs to exactly one space or one template. It is born blank (or as
// a copy of a template) and edited inside the system, so it is not a file.
export const mapsTable = pgTable(
    "maps",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        // Tiled JSON of the map. Never select it in listings.
        layout: jsonb("layout").$type<MapLayout>().notNull(),
        // Goes up on every tile or zone operation (optimistic concurrency).
        layoutVersion: integer("layout_version").notNull().default(1),
        width: integer("width").notNull(),
        height: integer("height").notNull(),
        tileSize: integer("tile_size").notNull().default(TILE_SIZE),
        sizeTier: mapSizeTierEnum("size_tier").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [index("maps_size_tier_index").on(table.sizeTier)],
);

export const mapsRelations = relations(mapsTable, ({ many }) => ({
    assets: many(mapAssetsTable),
}));
