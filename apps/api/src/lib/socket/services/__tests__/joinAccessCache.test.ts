import { beforeEach, describe, expect, it } from "vitest";
import { JoinAccessCache } from "../joinAccessCache";

const ACCESS = { isHost: false, isOwner: false };

describe("JoinAccessCache", () => {
    beforeEach(() => JoinAccessCache.clear());

    it("remembers an access by person and space", () => {
        JoinAccessCache.set("u1", "s1", ACCESS);

        expect(JoinAccessCache.get("u1", "s1")).toEqual(ACCESS);
        expect(JoinAccessCache.get("u1", "s2")).toBeUndefined();
        expect(JoinAccessCache.get("u2", "s1")).toBeUndefined();
    });

    it("forgets one access", () => {
        JoinAccessCache.set("u1", "s1", ACCESS);
        JoinAccessCache.set("u1", "s2", ACCESS);

        JoinAccessCache.invalidate("u1", "s1");

        expect(JoinAccessCache.get("u1", "s1")).toBeUndefined();
        expect(JoinAccessCache.get("u1", "s2")).toEqual(ACCESS);
    });

    it("forgets every access of a person", () => {
        JoinAccessCache.set("u1", "s1", ACCESS);
        JoinAccessCache.set("u1", "s2", ACCESS);
        JoinAccessCache.set("u2", "s1", ACCESS);

        JoinAccessCache.invalidateUser("u1");

        expect(JoinAccessCache.get("u1", "s1")).toBeUndefined();
        expect(JoinAccessCache.get("u1", "s2")).toBeUndefined();
        expect(JoinAccessCache.get("u2", "s1")).toEqual(ACCESS);
    });

    it("forgets every access to a space", () => {
        JoinAccessCache.set("u1", "s1", ACCESS);
        JoinAccessCache.set("u2", "s1", ACCESS);
        JoinAccessCache.set("u1", "s2", ACCESS);

        JoinAccessCache.invalidateSpace("s1");

        expect(JoinAccessCache.get("u1", "s1")).toBeUndefined();
        expect(JoinAccessCache.get("u2", "s1")).toBeUndefined();
        expect(JoinAccessCache.get("u1", "s2")).toEqual(ACCESS);
    });
});
