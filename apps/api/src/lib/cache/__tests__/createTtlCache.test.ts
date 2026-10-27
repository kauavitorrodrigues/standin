import { describe, expect, it } from "vitest";
import { createTtlCache } from "../createTtlCache";

describe("createTtlCache", () => {
    it("returns a value until the ttl passes", () => {
        let time = 0;
        const cache = createTtlCache<string>({
            ttlMs: 100,
            maxEntries: 10,
            now: () => time,
        });
        cache.set("a", "1");

        time = 99;
        expect(cache.get("a")).toBe("1");
        time = 100;
        expect(cache.get("a")).toBeUndefined();
    });

    it("does not refresh the expiry on read", () => {
        let time = 0;
        const cache = createTtlCache<string>({
            ttlMs: 100,
            maxEntries: 10,
            now: () => time,
        });
        cache.set("a", "1");
        time = 60;
        cache.get("a");
        time = 110;

        expect(cache.get("a")).toBeUndefined();
    });

    it("drops the oldest entry when full", () => {
        const cache = createTtlCache<string>({ ttlMs: 1000, maxEntries: 2 });
        cache.set("a", "1");
        cache.set("b", "2");
        cache.set("c", "3");

        expect(cache.get("a")).toBeUndefined();
        expect(cache.get("b")).toBe("2");
        expect(cache.get("c")).toBe("3");
    });

    it("deletes by key and by predicate", () => {
        const cache = createTtlCache<string>({ ttlMs: 1000, maxEntries: 10 });
        cache.set("u1:s1", "x");
        cache.set("u1:s2", "x");
        cache.set("u2:s1", "x");

        cache.delete("u2:s1");
        cache.deleteWhere((key) => key.startsWith("u1:"));

        expect(cache.get("u1:s1")).toBeUndefined();
        expect(cache.get("u1:s2")).toBeUndefined();
        expect(cache.get("u2:s1")).toBeUndefined();
    });
});
