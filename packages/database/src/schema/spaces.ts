import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    text,
    boolean,
    varchar,
    pgEnum,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { SPACE_GUEST_ACCESS } from "@standin/contracts";
import { organizationsTable } from "./organizations";
import { mapsTable } from "./maps";
import { usersTable } from "./users";
import { conversationsTable } from "./conversations";

export const spaceGuestAccessEnum = pgEnum(
    "space_guest_access",
    SPACE_GUEST_ACCESS
);

export const spacesTable = pgTable(
    "spaces",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        guestAccess: spaceGuestAccessEnum("guest_access")
            .notNull()
            .default(SPACE_GUEST_ACCESS.ALLOWED),

        // Per-space toggles, one typed column each. A new setting is a new
        // column with its default, which fills the existing spaces.
        enableSendNearbyInMapView: boolean("enable_send_nearby_in_map_view")
            .notNull()
            .default(true),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),
        mapId: text("map_id")
            .notNull()
            .references(() => mapsTable.id),
        createdBy: text("created_by").references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("spaces_organization_id_index").on(table.organizationId),
        // One map per space.
        uniqueIndex("spaces_map_id_unique")
            .on(table.mapId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("spaces_created_by_index").on(table.createdBy),
    ]
);

export const spacesRelations = relations(spacesTable, ({ one, many }) => ({
    creator: one(usersTable, {
        fields: [spacesTable.createdBy],
        references: [usersTable.id],
    }),
    map: one(mapsTable, {
        fields: [spacesTable.mapId],
        references: [mapsTable.id],
    }),
    conversations: many(conversationsTable),
}));
