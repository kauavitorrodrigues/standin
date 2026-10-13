import { relations, sql } from "drizzle-orm";
import { createdAtColumn, deletedAtColumn, uuidPrimaryKeyColumn } from "./common";
import {
    text,
    integer,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { assetsTable } from "./assets";

// Bundle: placing the root asset also creates its parts (a table with six
// chairs), each at an offset from the root anchor.
export const assetPartsTable = pgTable(
    "asset_parts",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        assetId: text("asset_id")
            .notNull()
            .references(() => assetsTable.id),
        partAssetId: text("part_asset_id")
            .notNull()
            .references(() => assetsTable.id),

        // Properties columns
        offsetX: integer("offset_x").notNull(),
        offsetY: integer("offset_y").notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("asset_parts_asset_id_part_asset_id_offset_unique")
            .on(table.assetId, table.partAssetId, table.offsetX, table.offsetY)
            .where(sql`${table.deletedAt} IS NULL`),
        index("asset_parts_asset_id_index").on(table.assetId),
        index("asset_parts_part_asset_id_index").on(table.partAssetId),
    ],
);

export const assetPartsRelations = relations(assetPartsTable, ({ one }) => ({
    asset: one(assetsTable, {
        fields: [assetPartsTable.assetId],
        references: [assetsTable.id],
        relationName: "root",
    }),
    part: one(assetsTable, {
        fields: [assetPartsTable.partAssetId],
        references: [assetsTable.id],
        relationName: "part",
    }),
}));
