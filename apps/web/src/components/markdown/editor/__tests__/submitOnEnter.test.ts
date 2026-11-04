// @vitest-environment jsdom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCoreExtensions } from "../consts/coreExtensions";
import { getMarkdown, textToDoc } from "../consts/plainText";
import { SubmitOnEnter } from "../extensions/SubmitOnEnter";

let editor: Editor | null = null;

const setup = (text: string) => {
    const onSubmit = vi.fn();
    editor = new Editor({
        extensions: [
            ...createCoreExtensions(),
            SubmitOnEnter.configure({ onSubmit }),
        ],
        content: textToDoc(text),
    });
    editor.commands.focus("end");
    return { editor, onSubmit };
};

const press = (target: Editor, init: KeyboardEventInit) => {
    const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
        ...init,
    });
    target.view.dom.dispatchEvent(event);
};

afterEach(() => editor?.destroy());

describe("Enter in the message editor", () => {
    it("sends and leaves the text as it was", () => {
        const { editor: current, onSubmit } = setup("oi");
        press(current, {});
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(getMarkdown(current)).toBe("oi");
    });

    it("sends with Ctrl+Enter too, like the textarea did", () => {
        const { editor: current, onSubmit } = setup("oi");
        press(current, { ctrlKey: true });
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(getMarkdown(current)).toBe("oi");
    });

    it("breaks the line on Shift+Enter without sending", () => {
        const { editor: current, onSubmit } = setup("oi");
        press(current, { shiftKey: true });
        expect(onSubmit).not.toHaveBeenCalled();
        expect(getMarkdown(current)).toBe("oi\n");
    });
});
