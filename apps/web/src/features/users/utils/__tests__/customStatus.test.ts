import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    buildCustomStatus,
    computeExpiresAt,
    initialDuration,
    keepableExpiresAt,
    isCustomStatusExpired,
    keepUnlessExpired,
    parseStoredCustomStatus,
} from "../customStatus";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

describe("computeExpiresAt", () => {
    // 14:30 on a local day.
    const now = new Date(2026, 5, 10, 14, 30, 0, 0).getTime();

    it("has no end when the status stays", () => {
        expect(computeExpiresAt("never", now)).toBeNull();
    });

    it("adds the chosen time", () => {
        expect(computeExpiresAt("30m", now)).toBe(now + 30 * MINUTE);
        expect(computeExpiresAt("1h", now)).toBe(now + HOUR);
        expect(computeExpiresAt("4h", now)).toBe(now + 4 * HOUR);
    });

    it("ends at the next local midnight for the end of the day", () => {
        expect(computeExpiresAt("today", now)).toBe(
            new Date(2026, 5, 11, 0, 0, 0, 0).getTime()
        );
    });

    it("ends at the next midnight when asked just before it", () => {
        const late = new Date(2026, 5, 10, 23, 59, 0, 0).getTime();

        expect(computeExpiresAt("today", late)).toBe(late + MINUTE);
    });

    it("never goes past the longest status", () => {
        // Right after midnight, a day of 25 hours would still be over a day.
        const early = new Date(2026, 5, 10, 0, 0, 0, 1).getTime();

        expect(computeExpiresAt("today", early)).toBeLessThanOrEqual(
            early + 24 * HOUR
        );
    });
});

describe("buildCustomStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 10, 14, 30, 0, 0));
    });

    afterEach(() => vi.useRealTimers());

    it("builds the status the server would take", () => {
        const now = Date.now();

        expect(
            buildCustomStatus(
                { text: " Lunch ", emoji: "🍽️", duration: "1h" },
                now
            )
        ).toEqual({ text: "Lunch", emoji: "🍽️", expiresAt: now + HOUR });
    });

    it("keeps a status with no end", () => {
        expect(
            buildCustomStatus(
                { text: "Focus", emoji: "🎧", duration: "never" },
                Date.now()
            )?.expiresAt
        ).toBeNull();
    });

    it.each([
        ["no text", { text: "   ", emoji: "💬" }],
        ["a text too long", { text: "x".repeat(81), emoji: "💬" }],
        ["no emoji", { text: "Hi", emoji: "" }],
        ["an emoji that is a letter", { text: "Hi", emoji: "a" }],
    ])("gives nothing for %s", (_name, fields) => {
        expect(
            buildCustomStatus({ ...fields, duration: "never" }, Date.now())
        ).toBeNull();
    });
});

describe("parseStoredCustomStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1_000_000);
    });

    afterEach(() => vi.useRealTimers());

    it("keeps a valid status that has not ended", () => {
        const status = { text: "Lunch", emoji: "🍕", expiresAt: 1_000_000 + 5 };

        expect(parseStoredCustomStatus(status)).toEqual(status);
        expect(
            parseStoredCustomStatus({ ...status, expiresAt: null })
        ).not.toBeNull();
    });

    it("drops a status that ended while the device was closed", () => {
        expect(
            parseStoredCustomStatus({
                text: "Lunch",
                emoji: "🍕",
                expiresAt: 1_000_000 - 10_000,
            })
        ).toBeNull();
    });

    it.each([null, "text", 3, {}, { text: "a" }])("drops %j", (stored) => {
        expect(parseStoredCustomStatus(stored)).toBeNull();
    });
});

describe("keeping the deadline", () => {
    const now = 1_000_000;
    const timed = { text: "Lunch", emoji: "🍕", expiresAt: now + HOUR };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => vi.useRealTimers());

    it("sends the same end again when the person only edits the text", () => {
        const edited = buildCustomStatus(
            { text: "Late lunch", emoji: "🍽️", duration: "keep" },
            now,
            timed.expiresAt
        );

        expect(edited).toEqual({
            text: "Late lunch",
            emoji: "🍽️",
            expiresAt: timed.expiresAt,
        });
    });

    it("replaces the end when the person picks another duration", () => {
        const edited = buildCustomStatus(
            { text: "Lunch", emoji: "🍕", duration: "4h" },
            now,
            timed.expiresAt
        );

        expect(edited?.expiresAt).toBe(now + 4 * HOUR);
        expect(
            buildCustomStatus(
                { text: "Lunch", emoji: "🍕", duration: "never" },
                now,
                timed.expiresAt
            )?.expiresAt
        ).toBeNull();
    });

    it("has nothing to keep when the end passed or there was none", () => {
        expect(computeExpiresAt("keep", now, now)).toBeNull();
        expect(computeExpiresAt("keep", now, now - 1)).toBeNull();
        expect(computeExpiresAt("keep", now, null)).toBeNull();
        expect(computeExpiresAt("keep", now)).toBeNull();
    });

    it("offers to keep only an end that is still ahead", () => {
        expect(keepableExpiresAt(timed, now)).toBe(timed.expiresAt);
        expect(keepableExpiresAt({ ...timed, expiresAt: now }, now)).toBeNull();
        expect(
            keepableExpiresAt({ ...timed, expiresAt: null }, now)
        ).toBeNull();
        expect(keepableExpiresAt(null, now)).toBeNull();
    });

    it("starts on keep for a timed status and on never otherwise", () => {
        expect(initialDuration(timed, now)).toBe("keep");
        expect(initialDuration({ ...timed, expiresAt: null }, now)).toBe(
            "never"
        );
        // An ended status counts as no status.
        expect(initialDuration({ ...timed, expiresAt: now - 1 }, now)).toBe(
            "never"
        );
        expect(initialDuration(null, now)).toBe("never");
    });
});

describe("keepUnlessExpired", () => {
    const status = { text: "Lunch", emoji: "🍕", expiresAt: 100 };

    it("keeps a status that has not ended and one that never ends", () => {
        expect(keepUnlessExpired(status, 99)).toBe(status);
        const forever = { ...status, expiresAt: null };
        expect(keepUnlessExpired(forever, 1e15)).toBe(forever);
    });

    it("gives nothing for a status that ended, or for none", () => {
        expect(keepUnlessExpired(status, 100)).toBeNull();
        expect(keepUnlessExpired(null, 0)).toBeNull();
    });
});

describe("isCustomStatusExpired", () => {
    const status = { text: "Lunch", emoji: "🍕" };

    it("is expired at and after the end", () => {
        expect(isCustomStatusExpired({ ...status, expiresAt: 100 }, 99)).toBe(
            false
        );
        expect(isCustomStatusExpired({ ...status, expiresAt: 100 }, 100)).toBe(
            true
        );
    });

    it("never expires without an end", () => {
        expect(
            isCustomStatusExpired({ ...status, expiresAt: null }, 1e15)
        ).toBe(false);
    });
});
