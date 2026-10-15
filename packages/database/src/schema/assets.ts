import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    type AnyPgColumn,
    text,
    varchar,
    integer,
    boolean,
    jsonb,
    pgEnum,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import {
    type AssetAnimation,
    ASSET_ACTIONS,
    ASSET_CATEGORIES,
    ASSET_PLACEMENTS,
    ASSET_ROTATIONS,
    ASSET_TYPES,
} from "@standin/contracts";
import { filesTable } from "./files";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

export const assetTypeEnum = pgEnum("asset_type", ASSET_TYPES);
export const assetCategoryEnum = pgEnum("asset_category", ASSET_CATEGORIES);
export const assetPlacementEnum = pgEnum("asset_placement", ASSET_PLACEMENTS);
export const assetActionEnum = pgEnum("asset_action", ASSET_ACTIONS);
export const assetRotationEnum = pgEnum("asset_rotation", ASSET_ROTATIONS);

// A placeable piece (chair, table, door, tree), one whole PNG per row. A
// variation (color or rotation) is another row pointing at the base through
// `base_asset_id`. Floor and wall tiles are not rows here, they live in the
// `tile_meta` of their tileset.
export const assetsTable = pgTable(
    "assets",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        // Null for the global library, an organization id for a private one.
        organizationId: text("organization_id").references(
            () => organizationsTable.id
        ),
        // Null when the row is a base asset. The target must be a base.
        baseAssetId: text("base_asset_id").references(
            (): AnyPgColumn => assetsTable.id
        ),
        // The PNG of the asset. Animated assets use a horizontal strip.
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),
        createdBy: text("created_by")
            .notNull()
            .references(() => usersTable.id),

        // Properties columns
        key: varchar("key", { length: 100 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        type: assetTypeEnum("type").notNull(),
        // Palette tab of the editor. Free in relation to type and action, and
        // equal across every variation of a family.
        category: assetCategoryEnum("category").notNull(),
        rotation: assetRotationEnum("rotation"),
        // Color of the row, both set or both null. The color is art content,
        // not a system enum. `colorHex` is `#RRGGBB` uppercase.
        colorKey: varchar("color_key", { length: 32 }),
        colorHex: varchar("color_hex", { length: 7 }),
        // Size of one frame, in px. Multiples of 32, read from the PNG.
        spriteW: integer("sprite_w").notNull(),
        spriteH: integer("sprite_h").notNull(),
        // Tiles occupied, separate from the sprite.
        footprintW: integer("footprint_w").notNull().default(1),
        footprintH: integer("footprint_h").notNull().default(1),
        footprintOffsetX: integer("footprint_offset_x").notNull().default(0),
        placement: assetPlacementEnum("placement")
            .notNull()
            .default(ASSET_PLACEMENTS.GROUND),
        // Height of the top, only for types that accept items on top.
        surfaceHeightPx: integer("surface_height_px").notNull().default(0),
        solid: boolean("solid").notNull().default(false),
        // Interactable when set.
        action: assetActionEnum("action"),
        actionParams: jsonb("action_params").$type<Record<string, unknown>>(),
        promptText: text("prompt_text"),
        // Horizontal strip playback. Null for static pieces.
        animation: jsonb("animation").$type<AssetAnimation>(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("assets_key_global_unique")
            .on(table.key)
            .where(
                sql`${table.organizationId} IS NULL AND ${table.deletedAt} IS NULL`
            ),
        uniqueIndex("assets_organization_id_key_unique")
            .on(table.organizationId, table.key)
            .where(
                sql`${table.organizationId} IS NOT NULL AND ${table.deletedAt} IS NULL`
            ),
        // One row per color and rotation in a family. The family is the base
        // id, or the own id for a base. Expressions avoid NULLS NOT DISTINCT,
        // and the enum cast to text is not immutable, hence the case.
        uniqueIndex("assets_family_color_rotation_unique")
            .on(
                sql`coalesce(${table.baseAssetId}, ${table.id})`,
                sql`coalesce(${table.colorKey}, '')`,
                sql`(case ${table.rotation}
                    when 'DEG_0' then 0
                    when 'DEG_90' then 1
                    when 'DEG_180' then 2
                    when 'DEG_270' then 3
                    else -1 end)`
            )
            .where(sql`${table.deletedAt} IS NULL`),
        index("assets_organization_id_index").on(table.organizationId),
        index("assets_base_asset_id_index").on(table.baseAssetId),
        index("assets_file_id_index").on(table.fileId),
        index("assets_type_index").on(table.type),
    ]
);

export const assetsRelations = relations(assetsTable, ({ one }) => ({
    file: one(filesTable, {
        fields: [assetsTable.fileId],
        references: [filesTable.id],
    }),
    baseAsset: one(assetsTable, {
        fields: [assetsTable.baseAssetId],
        references: [assetsTable.id],
    }),
}));
