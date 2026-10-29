import { describe, expect, it } from "vitest";
import { dedupeScopes } from "../dedupeScopes";
import { hasScope } from "../hasScope";
import { isTokenExpired } from "../isTokenExpired";
import { shouldTouchLastUsed } from "../shouldTouchLastUsed";

const now = new Date("2026-10-29T12:00:00.000Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("isTokenExpired", () => {
    it("never expires without a date", () => {
        expect(isTokenExpired(null, now)).toBe(false);
    });

    it("is expired at and after the date, not before", () => {
        expect(isTokenExpired(ago(1), now)).toBe(true);
        expect(isTokenExpired(now, now)).toBe(true);
        expect(isTokenExpired(ago(-1), now)).toBe(false);
    });
});

describe("hasScope", () => {
    it("checks the scope in the list", () => {
        expect(hasScope(["maps:write"], "maps:write")).toBe(true);
        expect(hasScope(["maps:write"], "library:write")).toBe(false);
    });
});

describe("shouldTouchLastUsed", () => {
    it("touches a token never used", () => {
        expect(shouldTouchLastUsed(null, now)).toBe(true);
    });

    it("waits one minute between writes", () => {
        expect(shouldTouchLastUsed(ago(59_999), now)).toBe(false);
        expect(shouldTouchLastUsed(ago(60_000), now)).toBe(true);
    });
});

describe("dedupeScopes", () => {
    it("drops repeated scopes and keeps the order", () => {
        expect(
            dedupeScopes(["maps:write", "library:write", "maps:write"])
        ).toEqual(["maps:write", "library:write"]);
    });
});
