import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import { text, varchar, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { organizationMembersTable } from "./organization-members";
import { organizationInvitesTable } from "./organization-invites";
import { mapsTable } from "./maps";
import { spacesTable } from "./spaces";

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

export const usersRelations = relations(usersTable, ({ many }) => ({
    organizations: many(organizationsTable),
    organizationMembers: many(organizationMembersTable),
    organizationInvites: many(organizationInvitesTable),
    maps: many(mapsTable),
    spaces: many(spacesTable),
}));
