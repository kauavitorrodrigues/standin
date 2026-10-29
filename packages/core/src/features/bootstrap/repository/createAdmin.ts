import {
    db,
    organizationsTable,
    organizationMembersTable,
    usersTable,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import { generateUniqueOrganizationSlug } from "../../organizations/utils/slugify";

type CreateAdminInput = {
    name: string;
    email: string;
    passwordHash: string;
    // Left out when the instance already has an organization.
    organizationName?: string;
};

// The admin and, when asked, the organization it owns, in one transaction so
// an install never stops halfway with an admin and no organization.
export const createAdmin = async ({
    name,
    email,
    passwordHash,
    organizationName,
}: CreateAdminInput) => {
    const slug = organizationName
        ? await generateUniqueOrganizationSlug(organizationName)
        : null;

    return db.transaction(async (tx) => {
        const [admin] = await tx
            .insert(usersTable)
            .values({
                name,
                email,
                password: passwordHash,
                role: USER_ROLES.ADMIN,
            })
            .returning({ id: usersTable.id, email: usersTable.email });

        if (!organizationName || !slug) return { admin, organization: null };

        const [organization] = await tx
            .insert(organizationsTable)
            .values({ name: organizationName, slug, ownerId: admin.id })
            .returning({
                id: organizationsTable.id,
                name: organizationsTable.name,
            });
        await tx.insert(organizationMembersTable).values({
            userId: admin.id,
            organizationId: organization.id,
            role: ORGANIZATION_MEMBER_ROLES.OWNER,
        });

        return { admin, organization };
    });
};
