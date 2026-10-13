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
    pgEnum,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { MAP_TEMPLATE_STATUSES } from "@standin/contracts";
import { filesTable } from "./files";
import { mapsTable } from "./maps";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

export const mapTemplateStatusEnum = pgEnum(
    "map_template_status",
    MAP_TEMPLATE_STATUSES
);

// Catalog entry for a complete map (tiles, zones and objects). It is not a
// space: no chat and no desk owners. Only admins create and publish.
export const mapTemplatesTable = pgTable(
    "map_templates",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        status: mapTemplateStatusEnum("status")
            .notNull()
            .default(MAP_TEMPLATE_STATUSES.DRAFT),

        // Relations columns
        mapId: text("map_id")
            .notNull()
            .references(() => mapsTable.id),
        // Null for a global template. Private templates are not built yet.
        organizationId: text("organization_id").references(
            () => organizationsTable.id
        ),
        // Required to publish.
        thumbnailFileId: text("thumbnail_file_id").references(
            () => filesTable.id
        ),
        createdBy: text("created_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("map_templates_map_id_unique")
            .on(table.mapId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("map_templates_status_index").on(table.status),
        index("map_templates_organization_id_index").on(table.organizationId),
        index("map_templates_created_by_index").on(table.createdBy),
    ]
);

export const mapTemplatesRelations = relations(
    mapTemplatesTable,
    ({ one }) => ({
        map: one(mapsTable, {
            fields: [mapTemplatesTable.mapId],
            references: [mapsTable.id],
        }),
        creator: one(usersTable, {
            fields: [mapTemplatesTable.createdBy],
            references: [usersTable.id],
        }),
    })
);
