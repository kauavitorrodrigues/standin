import { relations } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    text,
    integer,
    jsonb,
    pgTable,
    index,
    type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { assetsTable } from "./assets";
import { mapsTable } from "./maps";

// An object placed on a map, of a space or of a template. The same asset can
// appear in many positions and maps, one row per use.
export const mapAssetsTable = pgTable(
    "map_assets",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        mapId: text("map_id")
            .notNull()
            .references(() => mapsTable.id),
        // Already points at the chosen rotation.
        assetId: text("asset_id")
            .notNull()
            .references(() => assetsTable.id),
        // Item on a desk, or piece that came in a bundle.
        parentId: text("parent_id").references(
            (): AnyPgColumn => mapAssetsTable.id,
        ),

        // Properties columns
        // Bottom left cell of the footprint.
        tileX: integer("tile_x").notNull(),
        tileY: integer("tile_y").notNull(),
        // Only what changes in this instance (promptText, actionDisabled...).
        propertyOverrides: jsonb("property_overrides").$type<
            Record<string, unknown>
        >(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("map_assets_map_id_index").on(table.mapId),
        index("map_assets_asset_id_index").on(table.assetId),
        index("map_assets_parent_id_index").on(table.parentId),
    ],
);

export const mapAssetsRelations = relations(mapAssetsTable, ({ one }) => ({
    map: one(mapsTable, {
        fields: [mapAssetsTable.mapId],
        references: [mapsTable.id],
    }),
    asset: one(assetsTable, {
        fields: [mapAssetsTable.assetId],
        references: [assetsTable.id],
    }),
}));
