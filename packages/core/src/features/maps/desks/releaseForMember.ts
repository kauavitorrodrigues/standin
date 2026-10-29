import {
    db,
    deskAssignmentsTable,
    spacesTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import type { DeskChange } from "./types/desk-change";

/**
 * Frees every desk a person holds in the spaces of an organization, for when
 * they stop being a member of it. The spaces of a deleted organization count
 * too, so no row is left holding a desk for someone who is gone. One
 * statement, so it is all or nothing.
 *
 * @returns One entry per desk freed, for the caller to tell the clients.
 */
export const releaseMemberDesks = async (
    userId: string,
    organizationId: string
): Promise<DeskChange[]> =>
    db
        .update(deskAssignmentsTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                isNull(deskAssignmentsTable.deletedAt),
                eq(deskAssignmentsTable.userId, userId),
                inArray(
                    deskAssignmentsTable.spaceId,
                    db
                        .select({ id: spacesTable.id })
                        .from(spacesTable)
                        .where(eq(spacesTable.organizationId, organizationId))
                )
            )
        )
        .returning({
            spaceId: deskAssignmentsTable.spaceId,
            mapAssetId: deskAssignmentsTable.mapAssetId,
            userId: deskAssignmentsTable.userId,
        });
