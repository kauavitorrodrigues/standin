import { LOCK_TTL_MS } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { createMapLockService } from "../createMapLockService";

const ana = { id: "u1", name: "Ana" };
const result = {
    version: 2,
    idMap: { t1: "r1" },
    desks: [],
    limits: { objectsUsed: 1, objectsMax: 10 },
};

function setup() {
    let time = 1_700_000_000_000;
    const service = createMapLockService(() => time);
    const advance = (ms: number) => {
        time += ms;
    };
    return { service, advance };
}

describe("MapLockService.recordPublish", () => {
    it("keeps the publish on the lock of the session and keeps the lock", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");

        const ok = service.recordPublish("m1", "s1", {
            publishId: "p1",
            result,
        });

        expect(ok).toBe(true);
        expect(service.get("m1")?.lastPublish).toEqual({
            publishId: "p1",
            result,
        });
        expect(service.get("m1")?.sessionId).toBe("s1");
    });

    it("keeps only the last publish", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");
        service.recordPublish("m1", "s1", { publishId: "p1", result });
        service.recordPublish("m1", "s1", {
            publishId: "p2",
            result: { ...result, version: 3 },
        });

        expect(service.get("m1")?.lastPublish?.publishId).toBe("p2");
    });

    it("refuses another session and records nothing", () => {
        const { service } = setup();
        service.acquire("m1", ana, "s1");

        expect(
            service.recordPublish("m1", "s2", { publishId: "p1", result })
        ).toBe(false);
        expect(service.get("m1")?.lastPublish).toBeUndefined();
    });

    it("refuses when there is no lock", () => {
        const { service } = setup();
        expect(
            service.recordPublish("m1", "s1", { publishId: "p1", result })
        ).toBe(false);
    });

    it("refuses an expired lock", () => {
        const { service, advance } = setup();
        service.acquire("m1", ana, "s1");
        advance(LOCK_TTL_MS + 1);

        expect(
            service.recordPublish("m1", "s1", { publishId: "p1", result })
        ).toBe(false);
    });
});
