import { sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, varchar, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const usersTable = pgTable(
    "users",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        password: text("password").notNull(),
        avatar: text("avatar"),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),

        // Relations columns
    },
    (table) => [
        uniqueIndex("users_email_unique")
            .on(table.email)
            .where(sql`${table.deletedAt} IS NULL`),
    ],
);
