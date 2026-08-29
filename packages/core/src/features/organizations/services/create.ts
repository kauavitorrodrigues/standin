import { organizationSelect } from "../consts/select";
import { generateUniqueOrganizationSlug } from "../utils/slugify";
import {
    db,
    organizationsTable,
    organizationMembersTable,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";
import type { Organization, OrganizationDataSchemaType } from "@standin/contracts";

export const createOrganization = async (
    ownerId: string,
    data: OrganizationDataSchemaType,
): Promise<Organization> => {
    const { name } = data;
    const slug = await generateUniqueOrganizationSlug(name);

    return db.transaction(async (tx) => {
        const [organization] = await tx
            .insert(organizationsTable)
            .values({ name, slug, ownerId })
            .returning(organizationSelect);

        await tx.insert(organizationMembersTable).values({
            userId: ownerId,
            organizationId: organization.id,
            role: ORGANIZATION_MEMBER_ROLES.OWNER,
        });

        return organization;
    });
};
