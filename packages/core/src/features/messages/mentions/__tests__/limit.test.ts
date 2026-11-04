import { MAX_MESSAGE_MENTIONS } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { assertMentionLimit } from "../assertCanMention";

const people = (count: number) =>
    Array.from({ length: count }, (_, index) => `u${index}`);

describe("assertMentionLimit", () => {
    it("accepts a message at the limit", () => {
        expect(() =>
            assertMentionLimit(people(MAX_MESSAGE_MENTIONS))
        ).not.toThrow();
    });

    it("rejects a message past the limit", () => {
        expect(() =>
            assertMentionLimit(people(MAX_MESSAGE_MENTIONS + 1))
        ).toThrow();
    });
});
