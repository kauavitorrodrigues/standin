import type { Editor } from "@tiptap/core";
import type { InlineNode } from "../types";

const LINE_BREAK = "\n";

const toLineNodes = (line: string): InlineNode[] => {
    if (line.length === 0) return [];
    return [{ type: "text", text: line }];
};

// A message is one paragraph: every line break is a hard break, so the text
// that goes out is the text that was typed.
export const textToInline = (text: string): InlineNode[] =>
    text
        .replace(/\r\n?/g, LINE_BREAK)
        .split(LINE_BREAK)
        .flatMap((line, index): InlineNode[] => {
            const lineNodes = toLineNodes(line);
            if (index === 0) return lineNodes;
            return [{ type: "hardBreak" }, ...lineNodes];
        });

export const textToDoc = (text: string) => ({
    type: "doc",
    content: [{ type: "paragraph", content: textToInline(text) }],
});

type MarkdownStorage = { getMarkdown: () => string };

export const getMarkdown = (editor: Editor): string =>
    (
        editor.storage as unknown as { markdown: MarkdownStorage }
    ).markdown.getMarkdown();
