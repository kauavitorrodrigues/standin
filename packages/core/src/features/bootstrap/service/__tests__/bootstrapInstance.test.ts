import { beforeEach, describe, expect, it, vi } from "vitest";
import { BootstrapInputInvalidError } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    findActiveAdmin: vi.fn(),
    findFirstOrganization: vi.fn(),
    createAdmin: vi.fn(),
    createOrganization: vi.fn(),
    assignRandomAvatar: vi.fn(),
    hash: vi.fn(),
}));

vi.mock("bcryptjs", () => ({ default: { hash: mocks.hash } }));
vi.mock("../../repository", () => ({
    BootstrapRepository: {
        findActiveAdmin: mocks.findActiveAdmin,
        findFirstOrganization: mocks.findFirstOrganization,
        createAdmin: mocks.createAdmin,
    },
}));
vi.mock("../../../organizations", () => ({
    OrganizationService: { create: mocks.createOrganization },
}));
vi.mock("../../../avatar/user/assignRandomAvatar", () => ({
    assignRandomAvatar: mocks.assignRandomAvatar,
}));

import { bootstrapInstance } from "../bootstrapInstance";

const input = {
    email: "  Boss@Example.com ",
    password: "Strong-Password-1",
    organizationName: "Acme",
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.findActiveAdmin.mockResolvedValue(null);
    mocks.findFirstOrganization.mockResolvedValue(null);
    mocks.hash.mockImplementation(async (p: string) => `hash:${p}`);
    mocks.createAdmin.mockImplementation(async (data) => ({
        admin: { id: "admin-1", email: data.email },
        organization: data.organizationName
            ? { id: "org-1", name: data.organizationName }
            : null,
    }));
    mocks.createOrganization.mockImplementation(async (_owner, data) => ({
        id: "org-2",
        name: data.name,
    }));
});

describe("bootstrapInstance input", () => {
    it.each([
        ["a missing email", { ...input, email: undefined as any }],
        ["an invalid email", { ...input, email: "not-an-email" }],
        ["a weak password", { ...input, password: "abc" }],
        ["a password with a sequence", { ...input, password: "Abcdef-12345" }],
        ["a short organization name", { ...input, organizationName: "A" }],
        ["a short admin name", { ...input, name: "A" }],
    ])("rejects %s before touching the database", async (_label, data) => {
        await expect(bootstrapInstance(data)).rejects.toBeInstanceOf(
            BootstrapInputInvalidError
        );
        expect(mocks.findActiveAdmin).not.toHaveBeenCalled();
        expect(mocks.createAdmin).not.toHaveBeenCalled();
    });

    it("names the field and not the value", async () => {
        const error = await bootstrapInstance({
            ...input,
            password: "weakpass",
        }).catch((e) => e);

        expect(error.message).toContain("password");
        expect(error.message).not.toContain("weakpass");
    });

    it("applies the defaults for the name and the organization", async () => {
        await bootstrapInstance({ email: "boss@example.com" });

        expect(mocks.createAdmin).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Admin",
                organizationName: "Standin",
            })
        );
    });
});

describe("bootstrapInstance on a fresh instance", () => {
    it("creates the admin and the organization in one repository call", async () => {
        const result = await bootstrapInstance(input);

        expect(mocks.createAdmin).toHaveBeenCalledTimes(1);
        expect(mocks.createAdmin).toHaveBeenCalledWith({
            name: "Admin",
            email: "boss@example.com",
            passwordHash: "hash:Strong-Password-1",
            organizationName: "Acme",
        });
        expect(mocks.createOrganization).not.toHaveBeenCalled();
        expect(mocks.assignRandomAvatar).toHaveBeenCalledWith("admin-1");
        expect(result.steps.map((s) => [s.target, s.status])).toEqual([
            ["admin", "created"],
            ["organization", "created"],
        ]);
        expect(result.generatedPassword).toBeUndefined();
    });

    it("generates a valid password only when none is given", async () => {
        const result = await bootstrapInstance({
            ...input,
            password: undefined,
        });

        const hashed = mocks.hash.mock.calls[0][0];
        expect(result.generatedPassword).toBe(hashed);
        expect(hashed).toHaveLength(24);
        expect(hashed).not.toBe("Strong-Password-1");
    });

    it("generates a different password each time", async () => {
        const first = await bootstrapInstance({
            ...input,
            password: undefined,
        });
        const second = await bootstrapInstance({
            ...input,
            password: undefined,
        });

        expect(first.generatedPassword).not.toBe(second.generatedPassword);
    });
});

describe("bootstrapInstance on an instance that is set up", () => {
    it("changes nothing when the admin and an organization exist", async () => {
        mocks.findActiveAdmin.mockResolvedValue({
            id: "admin-1",
            email: "boss@example.com",
        });
        mocks.findFirstOrganization.mockResolvedValue({
            id: "org-1",
            name: "Acme",
        });

        const result = await bootstrapInstance({
            ...input,
            password: undefined,
        });

        expect(mocks.hash).not.toHaveBeenCalled();
        expect(mocks.createAdmin).not.toHaveBeenCalled();
        expect(mocks.createOrganization).not.toHaveBeenCalled();
        expect(mocks.assignRandomAvatar).not.toHaveBeenCalled();
        expect(result.steps.map((s) => s.status)).toEqual(["exists", "exists"]);
        expect(result.generatedPassword).toBeUndefined();
    });

    it("creates the organization for an existing admin when there is none", async () => {
        mocks.findActiveAdmin.mockResolvedValue({
            id: "admin-1",
            email: "boss@example.com",
        });

        const result = await bootstrapInstance(input);

        expect(mocks.createAdmin).not.toHaveBeenCalled();
        expect(mocks.createOrganization).toHaveBeenCalledWith("admin-1", {
            name: "Acme",
        });
        expect(result.steps.map((s) => s.status)).toEqual([
            "exists",
            "created",
        ]);
    });

    it("creates no second organization for a new admin", async () => {
        mocks.findFirstOrganization.mockResolvedValue({
            id: "org-9",
            name: "Other",
        });

        const result = await bootstrapInstance(input);

        expect(mocks.createAdmin).toHaveBeenCalledWith(
            expect.objectContaining({ organizationName: undefined })
        );
        expect(mocks.createOrganization).not.toHaveBeenCalled();
        expect(result.organizationId).toBe("org-9");
        expect(result.steps.map((s) => s.status)).toEqual([
            "created",
            "exists",
        ]);
    });
});
