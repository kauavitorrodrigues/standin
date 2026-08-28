import { sql } from "drizzle-orm";
import { deletedAtColumn, uuidPrimaryKeyColumn } from "./common";
import {
    text,
    pgEnum,
    pgTable,
    index,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
    "OWNER",
    "MEMBER",
]);

export const organizationMembersTable = pgTable(
    "organization_members",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationsTable.id),

        // Properties columns
        role: organizationMemberRoleEnum("role").notNull().default("MEMBER"),

        // Date columns
        joinedAt: timestamp("joined_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("organization_members_user_id_organization_id_unique")
            .on(table.userId, table.organizationId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("organization_members_organization_id_index").on(
            table.organizationId,
        ),
        index("organization_members_user_id_index").on(table.userId),
    ],
);
