import { sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    text,
    varchar,
    pgTable,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const organizationsTable = pgTable(
    "organizations",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull(),

        // Relations columns
        ownerId: text("owner_id")
            .notNull()
            .references(() => usersTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("organizations_slug_unique")
            .on(table.slug)
            .where(sql`${table.deletedAt} IS NULL`),
        index("organizations_owner_id_index").on(table.ownerId),
    ],
);
