import {
    db,
    organizationMembersTable,
    userProfilePicturesTable,
    usersTable,
    and,
    asc,
    count,
    eq,
    ilike,
    isNull,
    or,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";
import type {
    OrganizationMemberEntry,
    Page,
    PageQuery,
} from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import { buildSearchPattern } from "../../../lib/buildSearchPattern";
import { profilePictureJoin } from "../../users/utils/profilePictureJoin";

/**
 * A page of the people of the organization with their e-mail, for the owner's
 * list. The search matches the name or the e-mail.
 */
export const listOrganizationMemberEntries = async (
    organizationId: string,
    { page, take, search }: PageQuery
): Promise<Page<OrganizationMemberEntry>> => {
    const pattern = search ? buildSearchPattern(search) : undefined;
    const where = and(
        eq(organizationMembersTable.organizationId, organizationId),
        isNull(organizationMembersTable.deletedAt),
        isNull(usersTable.deletedAt),
        pattern
            ? or(
                  ilike(usersTable.name, pattern),
                  ilike(usersTable.email, pattern)
              )
            : undefined
    );

    const [totalRow] = await db
        .select({ total: count() })
        .from(organizationMembersTable)
        .innerJoin(
            usersTable,
            eq(usersTable.id, organizationMembersTable.userId)
        )
        .where(where);

    const rows = await db
        .select({
            userId: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: organizationMembersTable.role,
            joinedAt: organizationMembersTable.joinedAt,
            fileId: userProfilePicturesTable.fileId,
        })
        .from(organizationMembersTable)
        .innerJoin(
            usersTable,
            eq(usersTable.id, organizationMembersTable.userId)
        )
        .leftJoin(userProfilePicturesTable, profilePictureJoin)
        .where(where)
        // The id breaks ties so a page never repeats or skips a person.
        .orderBy(asc(usersTable.name), asc(usersTable.id))
        .limit(take)
        .offset((page - 1) * take);

    const items = rows.map((row) => ({
        userId: row.userId,
        name: row.name,
        email: row.email,
        profilePictureUrl: row.fileId ? buildFileUrl(row.fileId) : null,
        isOwner: row.role === ORGANIZATION_MEMBER_ROLES.OWNER,
        joinedAt: row.joinedAt.toISOString(),
    }));
    return { items, total: totalRow?.total ?? 0 };
};
