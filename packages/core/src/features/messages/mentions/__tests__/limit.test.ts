import { MAX_MESSAGE_MENTIONS, MentionSelfError } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { assertMentionLimit, assertNotSelfMention } from "../assertCanMention";

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

describe("assertNotSelfMention", () => {
    it("accepts a message that mentions other people", () => {
        expect(() => assertNotSelfMention("me", ["u1", "u2"])).not.toThrow();
        expect(() => assertNotSelfMention("me", [])).not.toThrow();
    });

    it("rejects a message that mentions its sender", () => {
        expect(() => assertNotSelfMention("me", ["u1", "me"])).toThrow(
            MentionSelfError
        );
    });
});
