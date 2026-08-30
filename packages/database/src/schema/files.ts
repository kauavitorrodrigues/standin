import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { sql } from "drizzle-orm";
import {
    text,
    varchar,
    bigint,
    pgTable,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const filesTable = pgTable(
    "files",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        originalName: text("original_name").notNull(),
        fileName: text("file_name").notNull(),
        extension: varchar("extension", { length: 32 }).notNull(),
        mimeType: varchar("mime_type", { length: 255 }).notNull(),
        sizeInBytes: bigint("size_in_bytes", { mode: "number" }).notNull(),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("files_file_name_unique")
            .on(table.fileName)
            .where(sql`${table.deletedAt} IS NULL`),
    ],
);
