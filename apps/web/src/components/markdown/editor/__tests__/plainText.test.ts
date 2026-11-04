import { describe, expect, it } from "vitest";
import { textToDoc, textToInline } from "../consts/plainText";

describe("textToInline", () => {
    it("keeps a single line as one text node", () => {
        expect(textToInline("olá")).toEqual([{ type: "text", text: "olá" }]);
    });

    it("turns every line break into a hard break", () => {
        expect(textToInline("a\n\nb")).toEqual([
            { type: "text", text: "a" },
            { type: "hardBreak" },
            { type: "hardBreak" },
            { type: "text", text: "b" },
        ]);
    });

    it("reads windows line endings as one break", () => {
        expect(textToInline("a\r\nb")).toEqual(textToInline("a\nb"));
    });

    it("gives no nodes for an empty text", () => {
        expect(textToInline("")).toEqual([]);
    });
});

describe("textToDoc", () => {
    it("wraps the text in one paragraph", () => {
        expect(textToDoc("a")).toEqual({
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "a" }] },
            ],
        });
    });
});
