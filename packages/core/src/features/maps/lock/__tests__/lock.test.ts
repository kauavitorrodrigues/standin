import { LOCK_HEARTBEAT_MS, LOCK_TTL_MS } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { createMapLockService } from "../createMapLockService";

const ana = { id: "u1", name: "Ana" };
const bia = { id: "u2", name: "Bia" };

function setup() {
    let time = 1_700_000_000_000;
    const service = createMapLockService(() => time);
    const advance = (ms: number) => {
        time += ms;
    };
    return { service, advance };
}

describe("MapLockService", () => {
    it("grants when there is no lock", () => {
        const { service } = setup();
        const result = service.acquire("m1", ana, "s1");
        expect(result.ok).toBe(true);
        expect(service.get("m1")?.sessionId).toBe("s1");
    });

    it("denies another person with by and since", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        const result = service.acquire("m1", bia, "s2");
        expect(result).toEqual({
            ok: false,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Ana" },
            since: new Date(1_700_000_000_000).toISOString(),
        });
    });

    it("grants the same person on another session and returns the old one", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        const result = service.acquire("m1", ana, "s2");
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.replacedSessionId).toBe("s1");
        expect(service.get("m1")?.sessionId).toBe("s2");
    });

    it("does not report a replaced session on the same session", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        const result = service.acquire("m1", ana, "s1");
        expect(result.ok && result.replacedSessionId).toBeFalsy();
    });

    it("expires without heartbeat and lets another person acquire", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1");
        advance(LOCK_TTL_MS + 1);
        expect(service.get("m1")).toBeUndefined();
        expect(service.acquire("m1", bia, "s2").ok).toBe(true);
    });

    it("keeps the lock alive with heartbeats", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1");
        for (let i = 0; i < 5; i++) {
            advance(LOCK_HEARTBEAT_MS);
            expect(service.heartbeat("m1", "s1")).toEqual({ ok: true });
        }
        expect(service.get("m1")).toBeDefined();
    });

    it("releases the lock", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        expect(service.release("m1", "s1")).toBe(true);
        expect(service.get("m1")).toBeUndefined();
    });

    it("does not release a lock held by another session", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        expect(service.release("m1", "s2")).toBe(false);
        expect(service.get("m1")).toBeDefined();
    });

    it("heartbeat returns ok false for a session that lost the lock", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        service.acquire("m1", ana, "s2");
        expect(service.heartbeat("m1", "s1")).toEqual({ ok: false });
        expect(service.heartbeat("m2", "s1")).toEqual({ ok: false });
    });

    it("sweepExpired returns the removed locks only", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1");
        advance(LOCK_TTL_MS - 1000);
        service.acquire("m2", bia, "s2");
        advance(2000);
        const removed = service.sweepExpired();
        expect(removed.map((lock) => lock.mapId)).toEqual(["m1"]);
        expect(service.get("m2")).toBeDefined();
        expect(service.sweepExpired()).toEqual([]);
    });
});
