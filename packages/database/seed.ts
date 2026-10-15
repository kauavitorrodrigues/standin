import bcrypt from "bcryptjs";
import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import {
    db,
    organizationMembersTable,
    organizationsTable,
    usersTable,
    and,
    eq,
    isNull,
} from "./src";

const BCRYPT_SALT_ROUNDS = 10;
const SEED_PASSWORD = "Sup3r$ecret";

const SEED_USERS = {
    admin: {
        name: "Admin",
        email: "admin@standin.dev",
        role: USER_ROLES.ADMIN,
    },
    owner: {
        name: "Owner",
        email: "owner@standin.dev",
        role: USER_ROLES.USER,
    },
    member: {
        name: "Member",
        email: "member@standin.dev",
        role: USER_ROLES.USER,
    },
};

const SEED_ORGANIZATION = { name: "Standin Demo", slug: "standin-demo" };

async function upsertUser(user: (typeof SEED_USERS)[keyof typeof SEED_USERS]) {
    const [existingUser] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
            and(eq(usersTable.email, user.email), isNull(usersTable.deletedAt)),
        );

    if (existingUser) {
        await db
            .update(usersTable)
            .set({ role: user.role })
            .where(eq(usersTable.id, existingUser.id));
        return existingUser.id;
    }

    const password = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);
    const [created] = await db
        .insert(usersTable)
        .values({ ...user, password })
        .returning({ id: usersTable.id });

    return created.id;
}

async function upsertOrganization(ownerId: string) {
    const [existing] = await db
        .select({ id: organizationsTable.id })
        .from(organizationsTable)
        .where(
            and(
                eq(organizationsTable.slug, SEED_ORGANIZATION.slug),
                isNull(organizationsTable.deletedAt),
            ),
        );

    if (existing) return existing.id;

    const [created] = await db
        .insert(organizationsTable)
        .values({ ...SEED_ORGANIZATION, ownerId })
        .returning({ id: organizationsTable.id });

    return created.id;
}

async function ensureMembership(
    userId: string,
    organizationId: string,
    role: (typeof ORGANIZATION_MEMBER_ROLES)[keyof typeof ORGANIZATION_MEMBER_ROLES],
) {
    const [existing] = await db
        .select({ id: organizationMembersTable.id })
        .from(organizationMembersTable)
        .where(
            and(
                eq(organizationMembersTable.userId, userId),
                eq(organizationMembersTable.organizationId, organizationId),
                isNull(organizationMembersTable.deletedAt),
            ),
        );

    if (existing) return;

    await db
        .insert(organizationMembersTable)
        .values({ userId, organizationId, role });
}

async function seed() {
    const adminId = await upsertUser(SEED_USERS.admin);
    const ownerId = await upsertUser(SEED_USERS.owner);
    const memberId = await upsertUser(SEED_USERS.member);

    const organizationId = await upsertOrganization(ownerId);
    await ensureMembership(
        ownerId,
        organizationId,
        ORGANIZATION_MEMBER_ROLES.OWNER,
    );
    await ensureMembership(
        memberId,
        organizationId,
        ORGANIZATION_MEMBER_ROLES.MEMBER,
    );

    console.log(`✓ Organização: ${SEED_ORGANIZATION.name}`);
    console.log(`✓ Admin:  ${SEED_USERS.admin.email} (${adminId})`);
    console.log(`✓ Owner:  ${SEED_USERS.owner.email}`);
    console.log(`✓ Member: ${SEED_USERS.member.email}`);
    console.log(`  Senha de todos: ${SEED_PASSWORD}`);
    process.exit(0);
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
