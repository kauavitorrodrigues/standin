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
import { FileService } from "../files";
import { SoundboardService } from "../soundboard";
import { SpaceGuestService, SpaceService } from "../spaces";
import { publishOrganizationMemberRemoved } from "./members/memberRemovedEvents";

export const deleteOrganization = async (id: string): Promise<Organization> => {
    const { organization, removedGuests, removedMembers, storageKeys } =
        await db.transaction(async (tx) => {
            const [organization] = await tx
                .update(organizationsTable)
                .set({ deletedAt: new Date() })
                .where(eq(organizationsTable.id, id))
                .returning(organizationSelect);

            const removedMembers = await tx
                .update(organizationMembersTable)
                .set({ deletedAt: new Date() })
                .where(
                    and(
                        eq(organizationMembersTable.organizationId, id),
                        isNull(organizationMembersTable.deletedAt)
                    )
                )
                .returning({ userId: organizationMembersTable.userId });

            const { removedGuests, storageKeys } =
                await SpaceService.deleteByOrganizationId(id, tx);

            // Its clips go with it, files included.
            const clipStorageKeys =
                await SoundboardService.deleteByOrganizationId(id, tx);

            return {
                organization,
                removedGuests,
                removedMembers,
                storageKeys: [...storageKeys, ...clipStorageKeys],
            };
        });

    // The photos of its spaces and its clips leave storage only now that the
    // deletion is committed. A failure is logged, the organization is gone.
    await FileService.purge(storageKeys);

    // The guests inside lose their sockets once the deletion is committed.
    await SpaceGuestService.publishRemoved(removedGuests);

    // The members inside lose their sockets too, since they are no longer
    // members of anything in it.
    for (const { userId } of removedMembers) {
        await publishOrganizationMemberRemoved({ userId, organizationId: id });
    }

    return organization;
};
