import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyByIdsMock } = vi.hoisted(() => ({
    findManyByIdsMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    UserService: { findManyByIds: findManyByIdsMock },
}));

import { resolveUserProfiles } from "../resolveUserProfiles";

describe("resolveUserProfiles", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("maps each user id to its name and photo", async () => {
        findManyByIdsMock.mockResolvedValue([
            { id: "user-a", name: "Ana", avatarUrl: "/files/ana" },
            { id: "user-b", name: "Bruno", avatarUrl: null },
        ]);

        const profiles = await resolveUserProfiles(["user-a", "user-b"]);

        expect(profiles.get("user-a")).toEqual({
            name: "Ana",
            avatarUrl: "/files/ana",
        });
        expect(profiles.get("user-b")).toEqual({
            name: "Bruno",
            avatarUrl: null,
        });
    });

    it("asks for each id once", async () => {
        findManyByIdsMock.mockResolvedValue([]);

        await resolveUserProfiles(["user-a", "user-a", "user-b"]);

        expect(findManyByIdsMock).toHaveBeenCalledWith(["user-a", "user-b"]);
    });

    it("gives no profiles when the query fails, instead of failing the presence", async () => {
        findManyByIdsMock.mockRejectedValue(new Error("db down"));

        const profiles = await resolveUserProfiles(["user-a"]);

        expect(profiles.size).toBe(0);
    });
});
