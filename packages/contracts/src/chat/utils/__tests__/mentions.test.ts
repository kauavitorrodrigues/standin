import { describe, expect, it } from "vitest";
import {
    buildMentionLink,
    formatMentionLink,
    parseMentionUserIds,
    replaceMentionsWithNames,
    splitContentByMentions,
} from "../mentions";

describe("parseMentionUserIds", () => {
    it("reads the ids from the links", () => {
        expect(
            parseMentionUserIds("oi [@Ana](mention:u1) e [@Bia](mention:u2)")
        ).toEqual(["u1", "u2"]);
    });

    it("lists a person once", () => {
        expect(
            parseMentionUserIds("[@Ana](mention:u1) [@Ana](mention:u1)")
        ).toEqual(["u1"]);
    });

    it("ignores other links and plain text", () => {
        expect(
            parseMentionUserIds("[site](https://x.dev) @Ana mention:u1")
        ).toEqual([]);
    });

    it("gives nothing for no content", () => {
        expect(parseMentionUserIds(null)).toEqual([]);
        expect(parseMentionUserIds("")).toEqual([]);
    });
});

describe("replaceMentionsWithNames", () => {
    it("shows the current name instead of the link", () => {
        const names = new Map([["u1", "Ana Maria"]]);
        expect(replaceMentionsWithNames("oi [@Ana](mention:u1)!", names)).toBe(
            "oi @Ana Maria!"
        );
    });

    it("keeps the typed label of a person with no current name", () => {
        expect(
            replaceMentionsWithNames("oi [@Ana](mention:u9)", new Map())
        ).toBe("oi @Ana");
    });
});

describe("splitContentByMentions", () => {
    it("splits the text around each mention in order", () => {
        expect(
            splitContentByMentions("oi [@Ana](mention:u1), tudo bem?")
        ).toEqual([
            { type: "text", text: "oi " },
            { type: "mention", label: "@Ana", userId: "u1" },
            { type: "text", text: ", tudo bem?" },
        ]);
    });

    it("keeps content with no mention as one text", () => {
        expect(splitContentByMentions("a [site](https://x.dev)")).toEqual([
            { type: "text", text: "a [site](https://x.dev)" },
        ]);
        expect(splitContentByMentions("")).toEqual([]);
    });

    it("handles two mentions side by side", () => {
        expect(
            splitContentByMentions("[@Ana](mention:u1)[@Bia](mention:u2)")
        ).toEqual([
            { type: "mention", label: "@Ana", userId: "u1" },
            { type: "mention", label: "@Bia", userId: "u2" },
        ]);
    });
});

describe("buildMentionLink", () => {
    it("builds a link the server reads back", () => {
        const link = buildMentionLink("u1", "Ana Lima");
        expect(link).toBe("[@Ana Lima](mention:u1)");
        expect(parseMentionUserIds(link)).toEqual(["u1"]);
    });

    it("drops brackets and line breaks from the name", () => {
        const link = buildMentionLink("u1", "A[n]a\n");
        expect(link).toBe("[@Ana](mention:u1)");
    });
});

describe("formatMentionLink", () => {
    it("writes the label as given", () => {
        expect(formatMentionLink("@Ana", "u1")).toBe("[@Ana](mention:u1)");
    });
});
