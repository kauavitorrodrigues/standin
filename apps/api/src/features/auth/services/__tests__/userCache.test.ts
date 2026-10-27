import { beforeEach, describe, expect, it } from "vitest";
import { UserCache } from "../userCache";

describe("UserCache", () => {
    beforeEach(() => UserCache.clear());

    it("hands out a user nobody can change", () => {
        UserCache.set({ id: "u1", name: "Ana" } as never);

        const user = UserCache.get("u1") as { name: string };

        expect(Object.isFrozen(user)).toBe(true);
    });

    it("forgets a user when told to", () => {
        UserCache.set({ id: "u1", name: "Ana" } as never);

        UserCache.invalidate("u1");

        expect(UserCache.get("u1")).toBeUndefined();
    });
});
