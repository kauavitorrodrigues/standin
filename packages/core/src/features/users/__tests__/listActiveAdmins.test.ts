import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listActiveAdmins: vi.fn() }));

vi.mock("../../bootstrap/repository", () => ({
    BootstrapRepository: { listActiveAdmins: mocks.listActiveAdmins },
}));

import { listActiveAdmins } from "../listActiveAdmins";

describe("listActiveAdmins", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("gives back what the repository finds", async () => {
        const admins = [
            { id: "a1", email: "a@example.com" },
            { id: "a2", email: "b@example.com" },
        ];
        mocks.listActiveAdmins.mockResolvedValue(admins);

        await expect(listActiveAdmins()).resolves.toEqual(admins);
    });

    it("gives an empty list when there is no admin", async () => {
        mocks.listActiveAdmins.mockResolvedValue([]);

        await expect(listActiveAdmins()).resolves.toEqual([]);
    });
});
