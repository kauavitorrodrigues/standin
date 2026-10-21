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
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { USER_ROLES } from "@standin/contracts";
import { organizationsTable } from "./organizations";
import { organizationMembersTable } from "./organization-members";
import { organizationInvitesTable } from "./organization-invites";
import { mapsTable } from "./maps";
import { spacesTable } from "./spaces";
import { conversationsTable } from "./conversations";
import { conversationParticipantsTable } from "./conversation-participants";
import { messagesTable } from "./messages";
import { messageReactionsTable } from "./message-reactions";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);

export const usersTable = pgTable(
    "users",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        password: text("password").notNull(),
        role: userRoleEnum("role").notNull().default(USER_ROLES.USER),

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
    ]
);

export const usersRelations = relations(usersTable, ({ many }) => ({
    organizations: many(organizationsTable),
    organizationMembers: many(organizationMembersTable),
    organizationInvites: many(organizationInvitesTable),
    maps: many(mapsTable),
    spaces: many(spacesTable),
    conversationsCreated: many(conversationsTable),
    conversationParticipants: many(conversationParticipantsTable),
    messages: many(messagesTable),
    messageReactions: many(messageReactionsTable),
}));
