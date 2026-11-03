import { relations, sql } from "drizzle-orm";
import {
    createdAtColumn,
    deletedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import { spacesTable } from "./spaces";
import { spaceInviteLinksTable } from "./space-invite-links";
import { usersTable } from "./users";

export const spaceGuestStatusEnum = pgEnum(
    "space_guest_status",
    SPACE_GUEST_STATUSES
);

export const spaceGuestStatusReasonEnum = pgEnum(
    "space_guest_status_reason",
    SPACE_GUEST_STATUS_REASONS
);

// The request of a person from outside the organization to enter a space, and
// the access it grants once a host admits it, in the same row.
export const spaceGuestsTable = pgTable(
    "space_guests",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Relations columns
        spaceId: text("space_id")
            .notNull()
            .references(() => spacesTable.id),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        inviteLinkId: text("invite_link_id").references(
            () => spaceInviteLinksTable.id
        ),
        respondedBy: text("responded_by").references(() => usersTable.id),

        // Properties columns
        // Reserved for the invite by email, nothing fills it yet.
        email: varchar("email", { length: 255 }),
        status: spaceGuestStatusEnum("status")
            .notNull()
            .default(SPACE_GUEST_STATUSES.PENDING),
        statusReason: spaceGuestStatusReasonEnum("status_reason")
            .notNull()
            .default(SPACE_GUEST_STATUS_REASONS.AWAITING_RESPONSE),
        respondedAt: timestamp("responded_at", { mode: "date" }),
        // When the request was made, or made again. A reopened request keeps its
        // row and its creation date, so this is what orders the requests.
        requestedAt: timestamp("requested_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        // A pending request vanishes 24h after it was made. An admitted guest
        // keeps the access until a host ends it, unless the link set a
        // validity: then it ends that long after the admission. Null is no end.
        expiresAt: timestamp("expires_at", { mode: "date" }),
        // A host moved the guest out of the lists. Kept for the record.
        archivedAt: timestamp("archived_at", { mode: "date" }),

        // Date columns
        createdAt: createdAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("space_guests_space_id_user_id_unique")
            .on(table.spaceId, table.userId)
            .where(sql`${table.deletedAt} IS NULL`),
        index("space_guests_user_id_index").on(table.userId),
        index("space_guests_space_id_status_index").on(
            table.spaceId,
            table.status
        ),
        // The list of guests of a space pages newest first.
        index("space_guests_space_id_requested_at_index").on(
            table.spaceId,
            table.requestedAt
        ),
    ]
);

export const spaceGuestsRelations = relations(spaceGuestsTable, ({ one }) => ({
    space: one(spacesTable, {
        fields: [spaceGuestsTable.spaceId],
        references: [spacesTable.id],
    }),
    user: one(usersTable, {
        fields: [spaceGuestsTable.userId],
        references: [usersTable.id],
    }),
    inviteLink: one(spaceInviteLinksTable, {
        fields: [spaceGuestsTable.inviteLinkId],
        references: [spaceInviteLinksTable.id],
    }),
}));
