import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    slug: vi.fn(),
    returned: [] as unknown[][],
}));

vi.mock("@standin/database", () => ({
    usersTable: { tag: "users", id: "id", email: "email" },
    organizationsTable: { tag: "orgs", id: "id", name: "name" },
    organizationMembersTable: { tag: "members" },
    db: { transaction: mocks.transaction },
}));
vi.mock("../../../organizations/utils/slugify", () => ({
    generateUniqueOrganizationSlug: mocks.slug,
}));

import { createAdmin } from "../createAdmin";

const tx = {
    insert: (table: { tag: string }) => {
        mocks.insert(table.tag);
        return {
            values: (values: unknown) => {
                mocks.values(table.tag, values);
                return {
                    returning: async () => mocks.returned.shift() ?? [],
                };
            },
        };
    },
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.returned = [];
    mocks.slug.mockResolvedValue("acme");
    mocks.transaction.mockImplementation(async (run) => run(tx));
});

const input = {
    name: "Admin",
    email: "boss@example.com",
    passwordHash: "hash",
};

describe("createAdmin", () => {
    it("inserts the admin, the organization and the owner membership in one transaction", async () => {
        mocks.returned = [
            [{ id: "admin-1", email: "boss@example.com" }],
            [{ id: "org-1", name: "Acme" }],
        ];

        const result = await createAdmin({
            ...input,
            organizationName: "Acme",
        });

        expect(mocks.transaction).toHaveBeenCalledTimes(1);
        expect(mocks.insert.mock.calls.map(([t]) => t)).toEqual([
            "users",
            "orgs",
            "members",
        ]);
        expect(mocks.values).toHaveBeenCalledWith(
            "users",
            expect.objectContaining({ role: "ADMIN", password: "hash" })
        );
        expect(mocks.values).toHaveBeenCalledWith(
            "orgs",
            expect.objectContaining({ slug: "acme", ownerId: "admin-1" })
        );
        expect(mocks.values).toHaveBeenCalledWith(
            "members",
            expect.objectContaining({
                userId: "admin-1",
                organizationId: "org-1",
                role: "OWNER",
            })
        );
        expect(result.organization).toEqual({ id: "org-1", name: "Acme" });
    });

    it("inserts only the admin when no organization is asked for", async () => {
        mocks.returned = [[{ id: "admin-1", email: "boss@example.com" }]];

        const result = await createAdmin(input);

        expect(mocks.insert.mock.calls.map(([t]) => t)).toEqual(["users"]);
        expect(mocks.slug).not.toHaveBeenCalled();
        expect(result.organization).toBeNull();
    });
});
