import { describe, expect, it } from "vitest";
import {
    NEARBY_MESSAGE_MAX_LENGTH,
    NEARBY_MESSAGE_RECEIVE_MAX_LENGTH,
} from "@standin/contracts";
import { isOnlyUrl } from "../isOnlyUrl";
import { isValidNearbyText } from "../isValidNearbyText";
import { sanitizeNearbyText } from "../sanitizeNearbyText";

describe("isOnlyUrl", () => {
    it("accepts one http or https link", () => {
        expect(isOnlyUrl("https://example.com/a?b=1")).toBe(true);
        expect(isOnlyUrl("http://example.com")).toBe(true);
    });

    it("rejects other protocols", () => {
        expect(isOnlyUrl("javascript:alert(1)")).toBe(false);
        expect(isOnlyUrl("data:text/html,hi")).toBe(false);
        expect(isOnlyUrl("ftp://example.com")).toBe(false);
    });

    it("rejects more than one word and plain text", () => {
        expect(isOnlyUrl("https://example.com ola")).toBe(false);
        expect(isOnlyUrl("example")).toBe(false);
        expect(isOnlyUrl("")).toBe(false);
    });
});

describe("sanitizeNearbyText", () => {
    it("removes the direction marks", () => {
        expect(sanitizeNearbyText("a‮b⁦c⁩")).toBe("abc");
    });

    it("folds control characters and spaces", () => {
        expect(sanitizeNearbyText("  a\n\tb   c\u0000d ")).toBe("a b c d");
    });
});

describe("isValidNearbyText", () => {
    const url = (length: number) =>
        `https://example.com/${"a".repeat(length - "https://example.com/".length)}`;

    it("rejects what is not a string, empty and spaces", () => {
        expect(isValidNearbyText(undefined)).toBe(false);
        expect(isValidNearbyText(12)).toBe(false);
        expect(isValidNearbyText("")).toBe(false);
        expect(isValidNearbyText("   \n ")).toBe(false);
    });

    it("accepts up to 50 characters of text", () => {
        expect(isValidNearbyText("a".repeat(NEARBY_MESSAGE_MAX_LENGTH))).toBe(
            true
        );
    });

    it("rejects 51 characters of text", () => {
        expect(
            isValidNearbyText("a".repeat(NEARBY_MESSAGE_MAX_LENGTH + 1))
        ).toBe(false);
    });

    it("accepts a long link and rejects it past 500", () => {
        expect(isValidNearbyText(url(120))).toBe(true);
        expect(isValidNearbyText(url(NEARBY_MESSAGE_RECEIVE_MAX_LENGTH))).toBe(
            true
        );
        expect(
            isValidNearbyText(url(NEARBY_MESSAGE_RECEIVE_MAX_LENGTH + 1))
        ).toBe(false);
    });

    it("rejects 501 characters even when it is a link", () => {
        expect(isValidNearbyText("a".repeat(501))).toBe(false);
    });

    it("does not exempt a long text that only starts as a link", () => {
        expect(isValidNearbyText(`${url(60)} and more words`)).toBe(false);
    });
});
