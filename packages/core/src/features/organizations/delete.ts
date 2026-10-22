import { organizationSelect } from "./consts/select";
import {
    db,
    organizationsTable,
    organizationMembersTable,
    eq,
    isNull,
    and,
} from "@standin/database";
import type { Organization } from "@standin/contracts";
import { SpaceGuestService, SpaceService } from "../spaces";

export const deleteOrganization = async (id: string): Promise<Organization> => {
    const { organization, removedGuests } = await db.transaction(async (tx) => {
        const [organization] = await tx
            .update(organizationsTable)
            .set({ deletedAt: new Date() })
            .where(eq(organizationsTable.id, id))
            .returning(organizationSelect);

        await tx
            .update(organizationMembersTable)
            .set({ deletedAt: new Date() })
            .where(
                and(
                    eq(organizationMembersTable.organizationId, id),
                    isNull(organizationMembersTable.deletedAt)
                )
            );

        const removedGuests = await SpaceService.deleteByOrganizationId(id, tx);

        return { organization, removedGuests };
    });

    // The guests inside lose their sockets once the deletion is committed.
    await SpaceGuestService.publishRemoved(removedGuests);
    return organization;
};
