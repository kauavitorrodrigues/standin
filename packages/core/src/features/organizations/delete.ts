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
import { SpaceService } from "../spaces";

export const deleteOrganization = async (id: string): Promise<Organization> => {
    return db.transaction(async (tx) => {
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

        await SpaceService.deleteByOrganizationId(id, tx);

        return organization;
    });
};
