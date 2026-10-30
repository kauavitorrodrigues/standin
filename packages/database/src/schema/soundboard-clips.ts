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
    real,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { filesTable } from "./files";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

// A short audio clip that members play into the call. Scoped like the library:
// a null organization is a default clip of the platform, otherwise the clip
// belongs to one organization and is usable in all of its spaces.
export const soundboardClipsTable = pgTable(
    "soundboard_clips",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 40 }).notNull(),
        // One icon shown on the tile, null when the uploader picked none.
        icon: varchar("icon", { length: 32 }),
        // Playback gain from 0 to 1, so a loud clip can be turned down.
        volume: real("volume").notNull().default(1),
        // Measured on the server from the stored file, never taken from the client.
        durationMs: integer("duration_ms").notNull(),

        // Relations columns
        // Null for a default clip of the platform.
        organizationId: text("organization_id").references(
            () => organizationsTable.id
        ),
        fileId: text("file_id")
            .notNull()
            .references(() => filesTable.id),
        createdById: text("created_by_id")
            .notNull()
            .references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("soundboard_clips_default_name_unique")
            .on(table.name)
            .where(
                sql`${table.organizationId} IS NULL AND ${table.deletedAt} IS NULL`
            ),
        uniqueIndex("soundboard_clips_organization_id_name_unique")
            .on(table.organizationId, table.name)
            .where(
                sql`${table.organizationId} IS NOT NULL AND ${table.deletedAt} IS NULL`
            ),
        index("soundboard_clips_organization_id_index").on(
            table.organizationId
        ),
        index("soundboard_clips_deleted_at_index").on(table.deletedAt),
        index("soundboard_clips_file_id_index").on(table.fileId),
        index("soundboard_clips_created_by_id_index").on(table.createdById),
    ]
);

export const soundboardClipsRelations = relations(
    soundboardClipsTable,
    ({ one }) => ({
        file: one(filesTable, {
            fields: [soundboardClipsTable.fileId],
            references: [filesTable.id],
        }),
        creator: one(usersTable, {
            fields: [soundboardClipsTable.createdById],
            references: [usersTable.id],
        }),
        organization: one(organizationsTable, {
            fields: [soundboardClipsTable.organizationId],
            references: [organizationsTable.id],
        }),
    })
);
