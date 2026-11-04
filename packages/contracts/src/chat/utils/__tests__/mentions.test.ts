import { describe, expect, it } from "vitest";
import { parseMentionUserIds, replaceMentionsWithNames } from "../mentions";

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
