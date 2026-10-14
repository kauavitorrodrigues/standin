import { describe, expect, it } from "vitest";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { getLockStatus } from "@/features/maps/__shared__/utils/getLockStatus";

describe("getLockStatus", () => {
    it("is acquiring while the ack is pending", () => {
        expect(getLockStatus({ acquireAck: null, lost: false })).toEqual({
            status: LOCK_STATUS.ACQUIRING,
        });
    });

    it("is held when the acquire was granted", () => {
        const acquireAck = { ok: true, heartbeatMs: 1, ttlMs: 3 } as const;
        expect(getLockStatus({ acquireAck, lost: false })).toEqual({
            status: LOCK_STATUS.HELD,
        });
    });

    it("is denied with the holder and the start time", () => {
        const acquireAck = {
            ok: false,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Ana" },
            since: "2026-01-01T00:00:00.000Z",
        } as const;
        expect(getLockStatus({ acquireAck, lost: false })).toEqual({
            status: LOCK_STATUS.DENIED,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Ana" },
            since: "2026-01-01T00:00:00.000Z",
        });
    });

    it("is lost whenever the lost flag is set", () => {
        const acquireAck = { ok: true, heartbeatMs: 1, ttlMs: 3 } as const;
        expect(getLockStatus({ acquireAck, lost: true })).toEqual({
            status: LOCK_STATUS.LOST,
        });
    });
});
