// @vitest-environment jsdom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { createCoreExtensions } from "../consts/coreExtensions";
import { getMarkdown, textToDoc } from "../consts/plainText";

let editor: Editor | null = null;

const load = (text: string): string => {
    editor = new Editor({
        extensions: createCoreExtensions(),
        content: textToDoc(text),
    });
    return getMarkdown(editor);
};

afterEach(() => editor?.destroy());

describe("the text a message is stored as", () => {
    it.each([
        ["plain text", "bom dia"],
        ["accents and emoji", "ação 😀"],
        ["a line break", "a\nb"],
        ["blank lines and a trailing break", "a\n\nb\n"],
        ["markdown characters", "2*3 e snake_case [x](y) # <b>&</b> \\ `c`"],
        ["spaces at the ends", "  a  "],
    ])("is unchanged for %s", (_label, text) => {
        expect(load(text)).toBe(text);
    });

    it("is empty for an empty field", () => {
        expect(load("")).toBe("");
    });
});
