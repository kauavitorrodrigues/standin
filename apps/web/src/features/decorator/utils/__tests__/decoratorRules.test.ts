import { describe, expect, it } from "vitest";
import type { MapLockState } from "@standin/contracts";
import { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";
import { DECORATOR_FAILURE_MODES } from "@/features/decorator/consts/failure-modes";
import { describeDeskItems } from "@/features/decorator/utils/describeDeskItems";
import { getDecorateAvailability } from "@/features/decorator/utils/getDecorateAvailability";
import { getDecorationResume } from "@/features/decorator/utils/getDecorationResume";
import { getDeniedDescription } from "@/features/decorator/utils/getDeniedDescription";
import { getFailureMode } from "@/features/decorator/utils/getFailureMode";
import { getLockNoticeText } from "@/features/decorator/utils/getLockNoticeText";
import { toProfileDecorate } from "@/features/decorator/utils/toProfileDecorate";
import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";

const FREE: MapLockState = { locked: false };
const held = (
    mode: "map" | "objects" | undefined,
    id = "ana"
): MapLockState => ({
    locked: true,
    by: { id, name: "Ana" },
    since: "2026-01-01T10:00:00.000Z",
    mode,
});

describe("getDecorateAvailability", () => {
    it("hides the entries without permission", () => {
        expect(
            getDecorateAvailability({
                canDecorate: false,
                lock: FREE,
                userId: "me",
            }).kind
        ).toBe(DECORATE_AVAILABILITY.HIDDEN);
    });

    it("enables them on a free map and on a lock of the same person", () => {
        const input = { canDecorate: true, userId: "me" };

        expect(getDecorateAvailability({ ...input, lock: FREE }).kind).toBe(
            DECORATE_AVAILABILITY.ENABLED
        );
        expect(
            getDecorateAvailability({ ...input, lock: held("objects", "me") })
                .kind
        ).toBe(DECORATE_AVAILABILITY.ENABLED);
    });

    it("blocks them with the reason while someone else decorates", () => {
        expect(
            getDecorateAvailability({
                canDecorate: true,
                lock: held("objects"),
                userId: "me",
            })
        ).toEqual({
            kind: DECORATE_AVAILABILITY.BLOCKED,
            reason: "Decorador em uso por Ana",
        });
    });

    it("blocks them with the reason while the owner edits the space", () => {
        const expected = {
            kind: DECORATE_AVAILABILITY.BLOCKED,
            reason: "Ana está editando o space",
        };

        expect(
            getDecorateAvailability({
                canDecorate: true,
                lock: held("map"),
                userId: "me",
            })
        ).toEqual(expected);
        expect(
            getDecorateAvailability({
                canDecorate: true,
                lock: held(undefined),
                userId: "me",
            })
        ).toEqual(expected);
    });
});

describe("toProfileDecorate", () => {
    const onDecorate = () => undefined;

    it("gives no button when hidden, a working one when enabled and an off one with the reason when blocked", () => {
        expect(
            toProfileDecorate(
                { kind: DECORATE_AVAILABILITY.HIDDEN },
                onDecorate
            )
        ).toBeUndefined();
        expect(
            toProfileDecorate(
                { kind: DECORATE_AVAILABILITY.ENABLED },
                onDecorate
            )
        ).toEqual({ onDecorate, disabledReason: null });
        expect(
            toProfileDecorate(
                { kind: DECORATE_AVAILABILITY.BLOCKED, reason: "motivo" },
                onDecorate
            )
        ).toEqual({ onDecorate, disabledReason: "motivo" });
    });
});

describe("getFailureMode", () => {
    const failures: Record<string, ClassifiedPublishError> = {
        validation: { kind: PUBLISH_ERROR_KIND.VALIDATION, issues: [] },
        stale: { kind: PUBLISH_ERROR_KIND.STALE },
        retryable: { kind: PUBLISH_ERROR_KIND.RETRYABLE },
        unknown: { kind: PUBLISH_ERROR_KIND.UNKNOWN },
        lockLost: { kind: PUBLISH_ERROR_KIND.LOCK_LOST },
    };

    it("has no dialog while nothing failed", () => {
        expect(getFailureMode(PUBLISH_PHASE.IDLE, null)).toBeNull();
        expect(getFailureMode(PUBLISH_PHASE.PUBLISHING, null)).toBeNull();
    });

    it("tells each failure apart", () => {
        const modeOf = (failure: ClassifiedPublishError) =>
            getFailureMode(PUBLISH_PHASE.ERROR, failure);

        expect(modeOf(failures.validation!)).toBe(
            DECORATOR_FAILURE_MODES.VALIDATION
        );
        expect(modeOf(failures.stale!)).toBe(DECORATOR_FAILURE_MODES.STALE);
        expect(modeOf(failures.retryable!)).toBe(
            DECORATOR_FAILURE_MODES.NETWORK
        );
        expect(modeOf(failures.unknown!)).toBe(DECORATOR_FAILURE_MODES.FAILED);
    });

    it("leaves the lost lock to the notice, with no dialog", () => {
        expect(
            getFailureMode(PUBLISH_PHASE.ERROR, failures.lockLost)
        ).toBeNull();
    });
});

describe("getDecorationResume", () => {
    const stored = (overrides = {}) => ({
        baseVersion: 1,
        baseObjectsRevision: "r1",
        ops: [{ type: "remove_asset", id: "a" } as const],
        ...overrides,
    });

    it("offers nothing without a saved decoration or without operations", () => {
        expect(getDecorationResume(null, "r1")).toEqual({ kind: "none" });
        expect(getDecorationResume(stored({ ops: [] }), "r1")).toEqual({
            kind: "none",
        });
    });

    it("offers it as it was when the objects did not change", () => {
        expect(getDecorationResume(stored(), "r1")).toMatchObject({
            kind: "offer",
            changed: false,
            paused: false,
        });
    });

    it("says it changed when the objects revision is another one", () => {
        expect(getDecorationResume(stored(), "r2")).toMatchObject({
            kind: "offer",
            changed: true,
        });
        expect(
            getDecorationResume(stored({ baseObjectsRevision: null }), "r2")
        ).toMatchObject({ changed: true });
    });

    it("says it was paused by the Studio", () => {
        expect(
            getDecorationResume(stored({ paused: true }), "r1")
        ).toMatchObject({ paused: true });
    });
});

describe("getDeniedDescription", () => {
    it("names who has the decorator or the Studio, and the lack of permission", () => {
        const denied = (
            code: "FORBIDDEN" | "MAP_LOCKED",
            mode?: "map" | "objects"
        ) => ({
            status: LOCK_STATUS.DENIED,
            code,
            by: { id: "ana", name: "Ana" },
            mode,
        });

        expect(getDeniedDescription(denied("MAP_LOCKED", "objects"))).toContain(
            "em uso por Ana"
        );
        expect(getDeniedDescription(denied("MAP_LOCKED", "map"))).toContain(
            "Ana está editando a estrutura"
        );
        expect(getDeniedDescription(denied("FORBIDDEN"))).toContain(
            "faz parte da organização"
        );
    });

    it("uses the fallback when the holder has no name", () => {
        expect(
            getDeniedDescription({
                status: LOCK_STATUS.DENIED,
                code: "MAP_LOCKED",
                mode: "objects",
            })
        ).toContain("outra pessoa");
    });
});

describe("getLockNoticeText", () => {
    it("speaks of the owner when the Studio took the lock and in general otherwise", () => {
        expect(getLockNoticeText("MAP_EDITING")).toContain("O dono abriu");
        expect(getLockNoticeText("EXPIRED")).toContain("perdeu o decorator");
        expect(getLockNoticeText(null)).toContain("perdeu o decorator");
    });
});

describe("describeDeskItems", () => {
    it("says how many items go with the desk, or nothing", () => {
        expect(describeDeskItems(0)).toBeNull();
        expect(describeDeskItems(1)).toBe(
            "1 item que está sobre ela vai junto."
        );
        expect(describeDeskItems(3)).toBe(
            "3 itens que estão sobre ela vão junto."
        );
    });
});
