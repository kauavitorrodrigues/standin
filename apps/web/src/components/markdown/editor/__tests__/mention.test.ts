// @vitest-environment jsdom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { createCoreExtensions } from "../consts/coreExtensions";
import { storedFragmentText, storedLength } from "../consts/measureText";
import { getMarkdown, textToDoc } from "../consts/plainText";

let editor: Editor | null = null;

const load = (text: string): Editor => {
    editor = new Editor({
        extensions: createCoreExtensions(),
        content: textToDoc(text),
    });
    return editor;
};

afterEach(() => editor?.destroy());

const LINK = "[@Ana](mention:u1)";

describe("the mention node", () => {
    it("is stored as a link and read back from it", () => {
        const text = `oi ${LINK}, tudo bem?`;
        expect(getMarkdown(load(text))).toBe(text);
    });

    it("loads as one piece with the id and the label", () => {
        const loaded = load(`a ${LINK}`);
        const mention = loaded.state.doc.firstChild?.lastChild;
        expect(mention?.type.name).toBe("mention");
        expect(mention?.attrs).toEqual({ id: "u1", label: "@Ana" });
    });

    it("keeps a mention next to a line break", () => {
        const text = `${LINK}\n${LINK}`;
        expect(getMarkdown(load(text))).toBe(text);
    });

    it("is inserted as a mention and stored as a link", () => {
        const loaded = load("oi ");
        loaded.commands.focus("end");
        loaded.commands.insertContent({
            type: "mention",
            attrs: { id: "u2", label: "@Bia" },
        });
        expect(getMarkdown(loaded)).toBe("oi [@Bia](mention:u2)");
    });
});

describe("the stored length", () => {
    it("counts the link of a mention, not the chip", () => {
        const text = `oi ${LINK}`;
        expect(storedLength(load(text).state.doc)).toBe(text.length);
    });

    it("counts a line break as one character", () => {
        expect(storedLength(load("a\nb").state.doc)).toBe(3);
    });
});

describe("copying a mention", () => {
    it("writes the link, so a paste brings the chip back", () => {
        const loaded = load(`oi ${LINK} x`);
        const doc = loaded.state.doc;
        expect(storedFragmentText(doc.content)).toBe(`oi ${LINK} x`);
    });

    it("does not put the id or the label on the page element", () => {
        const html = load(LINK).getHTML();
        expect(html).toContain('data-mention-id="u1"');
        expect(html).not.toMatch(/\sid="u1"/);
        expect(html).not.toMatch(/\slabel=/);
    });
});
