import { describe, expect, it } from "vitest";
import {
    LOCK_GIVE_UP_REASON,
    LOCK_RECOVERY,
    LOCK_RECOVERY_DELAYS_MS,
} from "@/features/maps/__shared__/consts/lock-recovery";
import { getLockRecovery } from "@/features/maps/__shared__/utils/getLockRecovery";
import { getLockRecoveryDelay } from "@/features/maps/__shared__/utils/getLockRecoveryDelay";

const GRANTED = { ok: true, heartbeatMs: 15000, ttlMs: 45000 } as const;
const DENIED = {
    ok: false,
    code: "MAP_LOCKED",
    by: { id: "u2", name: "Bia" },
} as const;

describe("getLockRecovery", () => {
    it("resumes when the lock is ours and the version is the same", () => {
        expect(
            getLockRecovery({
                ack: GRANTED,
                publishedVersion: 3,
                baseVersion: 3,
            })
        ).toEqual({ kind: LOCK_RECOVERY.RESUME });
    });

    it("gives up when the lock is ours but the version changed", () => {
        expect(
            getLockRecovery({
                ack: GRANTED,
                publishedVersion: 4,
                baseVersion: 3,
            })
        ).toEqual({
            kind: LOCK_RECOVERY.GIVE_UP,
            reason: LOCK_GIVE_UP_REASON.VERSION_CHANGED,
        });
    });

    it("gives up when someone else holds the lock", () => {
        expect(
            getLockRecovery({
                ack: DENIED,
                publishedVersion: null,
                baseVersion: 3,
            })
        ).toEqual({
            kind: LOCK_RECOVERY.GIVE_UP,
            reason: LOCK_GIVE_UP_REASON.DENIED,
        });
    });

    it("gives up on a refusal for lack of permission", () => {
        expect(
            getLockRecovery({
                ack: { ok: false, code: "FORBIDDEN" },
                publishedVersion: null,
                baseVersion: 3,
            }).kind
        ).toBe(LOCK_RECOVERY.GIVE_UP);
    });

    it("tries again on a network error", () => {
        expect(
            getLockRecovery({
                ack: null,
                publishedVersion: null,
                baseVersion: 3,
            })
        ).toEqual({ kind: LOCK_RECOVERY.RETRY });
    });

    it("tries again when the lock is ours but the version could not be read", () => {
        expect(
            getLockRecovery({
                ack: GRANTED,
                publishedVersion: null,
                baseVersion: 3,
            })
        ).toEqual({ kind: LOCK_RECOVERY.RETRY });
    });
});

describe("getLockRecoveryDelay", () => {
    it("starts immediate, grows and repeats the last delay", () => {
        expect(getLockRecoveryDelay(1)).toBe(0);
        expect(getLockRecoveryDelay(2)).toBeGreaterThan(0);
        expect(getLockRecoveryDelay(3)).toBeGreaterThan(
            getLockRecoveryDelay(2)
        );
        const last =
            LOCK_RECOVERY_DELAYS_MS[LOCK_RECOVERY_DELAYS_MS.length - 1];
        expect(getLockRecoveryDelay(99)).toBe(last);
    });
});
