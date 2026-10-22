import { describe, expect, it } from "vitest";
import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import {
    effectiveState,
    hasGuestAccess,
    hasLivePass,
    isLapsed,
    isWaiting,
    windowEnd,
} from "../guestState";

const now = new Date("2026-10-22T12:00:00Z");
const HOUR = 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(now.getTime() + offsetMs);

const row = (
    status: keyof typeof SPACE_GUEST_STATUSES,
    expiresAt: Date,
    statusReason: keyof typeof SPACE_GUEST_STATUS_REASONS = "AWAITING_RESPONSE"
) => ({
    status: SPACE_GUEST_STATUSES[status],
    statusReason: SPACE_GUEST_STATUS_REASONS[statusReason],
    expiresAt,
});

describe("windowEnd", () => {
    it("is 24 hours after the moment", () => {
        expect(windowEnd(now).getTime() - now.getTime()).toBe(24 * HOUR);
    });
});

describe("hasGuestAccess", () => {
    it("lets an admitted guest in until the window ends", () => {
        expect(hasGuestAccess(row("ADMITTED", at(HOUR)), now)).toBe(true);
    });

    it("closes at the exact end of the window", () => {
        expect(hasGuestAccess(row("ADMITTED", now), now)).toBe(false);
    });

    it("never lets a pending or denied guest in", () => {
        expect(hasGuestAccess(row("PENDING", at(HOUR)), now)).toBe(false);
        expect(hasGuestAccess(row("DENIED", at(HOUR)), now)).toBe(false);
    });
});

describe("isWaiting and hasLivePass", () => {
    it("a pending request inside its window is waiting", () => {
        expect(isWaiting(row("PENDING", at(HOUR)), now)).toBe(true);
        expect(hasLivePass(row("PENDING", at(HOUR)), now)).toBe(true);
    });

    it("a pending request past its window is not", () => {
        expect(isWaiting(row("PENDING", at(-HOUR)), now)).toBe(false);
        expect(hasLivePass(row("PENDING", at(-HOUR)), now)).toBe(false);
    });

    it("an admitted guest inside the window has a live pass", () => {
        expect(hasLivePass(row("ADMITTED", at(HOUR)), now)).toBe(true);
    });

    it("a denied row never has one", () => {
        expect(hasLivePass(row("DENIED", at(HOUR)), now)).toBe(false);
    });
});

describe("isLapsed and effectiveState", () => {
    it("reads a lapsed pending request as denied by timeout", () => {
        const lapsed = row("PENDING", at(-HOUR));

        expect(isLapsed(lapsed, now)).toBe(true);
        expect(effectiveState(lapsed, now)).toEqual({
            status: "DENIED",
            statusReason: "TIMEOUT",
        });
    });

    it("reads a lapsed admission as denied by timeout", () => {
        expect(
            effectiveState(row("ADMITTED", at(-1), "HOST_ADMITTED"), now)
        ).toEqual({ status: "DENIED", statusReason: "TIMEOUT" });
    });

    it("keeps the reason of a row that was denied for real", () => {
        const denied = row("DENIED", at(-HOUR), "HOST_DENIED");

        expect(isLapsed(denied, now)).toBe(false);
        expect(effectiveState(denied, now)).toEqual({
            status: "DENIED",
            statusReason: "HOST_DENIED",
        });
    });

    it("keeps a live row as it is", () => {
        expect(
            effectiveState(row("ADMITTED", at(HOUR), "HOST_ADMITTED"), now)
        ).toEqual({ status: "ADMITTED", statusReason: "HOST_ADMITTED" });
    });
});
