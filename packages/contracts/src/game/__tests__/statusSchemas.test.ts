import { describe, expect, it } from "vitest";
import { CUSTOM_STATUS } from "../consts/custom-status";
import { StatusInvalidError, StatusNotAllowedError } from "../errors";
import { CustomStatusSchema, SpaceSetStatusSchema } from "../schemas/realtime";
import { SpaceEvents } from "../types/events";

const inOneHour = () => Date.now() + 60 * 60 * 1000;

const status = (overrides: Record<string, unknown> = {}) => ({
    text: "In a meeting",
    emoji: "📅",
    expiresAt: inOneHour(),
    ...overrides,
});

describe("CustomStatusSchema", () => {
    it("accepts a status with and without an end", () => {
        expect(CustomStatusSchema.safeParse(status()).success).toBe(true);
        expect(
            CustomStatusSchema.safeParse(status({ expiresAt: null })).success
        ).toBe(true);
    });

    it("trims the text", () => {
        const parsed = CustomStatusSchema.safeParse(status({ text: "  hi  " }));

        expect(parsed.success && parsed.data.text).toBe("hi");
    });

    it("accepts emojis made of several code points", () => {
        ["👨‍👩‍👧", "🇧🇷", "👍🏽", "❤️"].forEach((emoji) => {
            expect(
                CustomStatusSchema.safeParse(status({ emoji })).success
            ).toBe(true);
        });
    });

    it.each([
        ["an empty text", { text: "" }],
        ["a text of spaces", { text: "   " }],
        [
            "a text that is too long",
            { text: "x".repeat(CUSTOM_STATUS.textMaxLength + 1) },
        ],
        ["a text that is not a string", { text: 3 }],
        ["an empty emoji", { emoji: "" }],
        ["a letter in place of the emoji", { emoji: "a" }],
        ["two emojis", { emoji: "😀😀" }],
        ["an emoji followed by a letter", { emoji: "😀a" }],
        ["a long grapheme", { emoji: "😀" + "️".repeat(100_000) }],
        ["a long family sequence", { emoji: "👨" + "‍👨".repeat(40) }],
        ["an end in the past", { expiresAt: Date.now() - 10_000 }],
        ["an end that is not whole", { expiresAt: inOneHour() + 0.5 }],
        [
            "an end beyond the longest status",
            { expiresAt: Date.now() + CUSTOM_STATUS.maxDurationMs * 2 },
        ],
        ["an end as text", { expiresAt: "tomorrow" }],
        ["a missing end", { expiresAt: undefined }],
    ])("refuses %s", (_name, overrides) => {
        expect(CustomStatusSchema.safeParse(status(overrides)).success).toBe(
            false
        );
    });

    it("takes an end a little off because of the clocks", () => {
        const slow = status({ expiresAt: Date.now() - 1000 });
        const fast = status({
            expiresAt: Date.now() + CUSTOM_STATUS.maxDurationMs + 30_000,
        });

        expect(CustomStatusSchema.safeParse(slow).success).toBe(true);
        expect(CustomStatusSchema.safeParse(fast).success).toBe(true);
    });

    it("accepts a text of exactly the longest length", () => {
        const text = "x".repeat(CUSTOM_STATUS.textMaxLength);

        expect(CustomStatusSchema.safeParse(status({ text })).success).toBe(
            true
        );
    });
});

describe("SpaceSetStatusSchema", () => {
    it("accepts away and active, with or without a custom status", () => {
        ["active", "away"].forEach((availability) => {
            expect(
                SpaceSetStatusSchema.safeParse({
                    availability,
                    customStatus: null,
                }).success
            ).toBe(true);
        });
        expect(
            SpaceSetStatusSchema.safeParse({
                availability: "active",
                customStatus: status(),
            }).success
        ).toBe(true);
    });

    it.each([
        {},
        { availability: "active" },
        { availability: "busy", customStatus: null },
        { availability: "gone", customStatus: null },
        { availability: "active", customStatus: status({ text: "" }) },
        { availability: "active", customStatus: "hello" },
    ])("refuses %j", (payload) => {
        expect(SpaceSetStatusSchema.safeParse(payload).success).toBe(false);
    });
});

describe("the status events and errors", () => {
    it("name the events apart from the others", () => {
        expect(SpaceEvents.SPACE_SET_STATUS).toBe("space:set-status");
        expect(SpaceEvents.SPACE_STATUS).toBe("space:status");
    });

    it("carry their own code and status", () => {
        expect(new StatusNotAllowedError()).toMatchObject({
            code: "STATUS_NOT_ALLOWED",
            status: 403,
        });
        expect(new StatusInvalidError()).toMatchObject({
            code: "STATUS_INVALID",
            status: 422,
        });
    });
});
