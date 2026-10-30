import { LOCK_HEARTBEAT_MS, LOCK_TTL_MS } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { APPLY_SESSION_PREFIX } from "../consts/apply-session";
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
            mode: "map",
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

describe("MapLockService modes", () => {
    it("defaults to the map mode", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        expect(service.get("m1")?.mode).toBe("map");
    });

    it("grants a decorator when there is no lock", () => {
        const { service } = setup();
        const result = service.acquire("m1", ana, "s1", "objects");
        expect(result.ok).toBe(true);
        expect(service.get("m1")?.mode).toBe("objects");
    });

    it("denies a second decorator of another person, first one holds", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "objects");
        const result = service.acquire("m1", bia, "s2", "objects");
        expect(result).toEqual({
            ok: false,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Ana" },
            since: new Date(1_700_000_000_000).toISOString(),
            mode: "objects",
        });
        expect(service.get("m1")?.sessionId).toBe("s1");
    });

    it("lets the same person take the decorator on another session", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "objects");
        const result = service.acquire("m1", ana, "s2", "objects");
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.replacedSessionId).toBe("s1");
            expect(result.preemptedSessionId).toBeUndefined();
        }
        expect(service.get("m1")?.sessionId).toBe("s2");
    });

    it("denies a decorator while the Studio is open, even for the same person", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "map");

        const other = service.acquire("m1", bia, "s2", "objects");
        const same = service.acquire("m1", ana, "s3", "objects");

        expect(other).toMatchObject({
            ok: false,
            code: "MAP_LOCKED",
            mode: "map",
        });
        expect(same).toMatchObject({
            ok: false,
            code: "MAP_LOCKED",
            mode: "map",
        });
        expect(service.get("m1")?.sessionId).toBe("s1");
    });

    it("lets the Studio preempt the decorator of anyone and names the session", () => {
        const { service } = setup();
        service.acquire("m1", bia, "s1", "objects");

        const result = service.acquire("m1", ana, "s2", "map");

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.preemptedSessionId).toBe("s1");
            expect(result.replacedSessionId).toBeUndefined();
            expect(result.lock.mode).toBe("map");
        }
        expect(service.get("m1")).toMatchObject({
            sessionId: "s2",
            mode: "map",
        });
    });

    it("preempts the decorator of the same person too", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "objects");

        const result = service.acquire("m1", ana, "s2", "map");

        expect(result.ok && result.preemptedSessionId).toBe("s1");
    });

    it("denies a second Studio of another person", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "map");
        const result = service.acquire("m1", bia, "s2", "map");
        expect(result).toMatchObject({ ok: false, mode: "map" });
    });

    it("lets the same person take the Studio on another session", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "map");
        const result = service.acquire("m1", ana, "s2", "map");
        expect(result.ok && result.replacedSessionId).toBe("s1");
    });

    it("renews the same session without reporting anyone", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1", "objects");
        const result = service.acquire("m1", ana, "s1", "objects");
        expect(result.ok && result.replacedSessionId).toBeFalsy();
        expect(result.ok && result.preemptedSessionId).toBeFalsy();
    });

    it("grants another mode once the lock expired", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1", "map");
        advance(LOCK_TTL_MS + 1);
        const result = service.acquire("m1", bia, "s2", "objects");
        expect(result.ok).toBe(true);
        expect(service.get("m1")?.mode).toBe("objects");
    });

    it("keeps a decorator alive with heartbeats and expires it without", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1", "objects");
        advance(LOCK_HEARTBEAT_MS);
        expect(service.heartbeat("m1", "s1")).toEqual({ ok: true });
        advance(LOCK_TTL_MS + 1);
        expect(service.get("m1")).toBeUndefined();
    });

    it("does not carry the last publish over a preemption", () => {
        const { service } = setup();
        service.acquire("m1", bia, "s1", "objects");
        service.recordPublish("m1", "s1", {
            publishId: "p1",
            result: {
                version: 1,
                idMap: {},
                limits: { objectsUsed: 0, objectsMax: 1 },
            },
        });
        service.acquire("m1", ana, "s2", "map");
        expect(service.get("m1")?.lastPublish).toBeUndefined();
    });
});

describe("MapLockService with an apply lock", () => {
    it("denies the same person in the Studio while an apply holds the lock", () => {
        const { service } = setup();
        service.acquire("m1", ana, `${APPLY_SESSION_PREFIX}abc`);
        const result = service.acquire("m1", ana, "s2");
        expect(result.ok).toBe(false);
        expect(service.get("m1")?.sessionId).toBe(`${APPLY_SESSION_PREFIX}abc`);
    });

    it("denies a decorator too", () => {
        const { service } = setup();
        service.acquire("m1", ana, `${APPLY_SESSION_PREFIX}abc`);
        expect(service.acquire("m1", bia, "s2", "objects").ok).toBe(false);
    });
});
