import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, varchar, pgTable, index } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";

export const spacesTable = pgTable(
    "spaces",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),

        // Relations columns
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        index("spaces_organization_id_index").on(table.organizationId),
    ],
);
