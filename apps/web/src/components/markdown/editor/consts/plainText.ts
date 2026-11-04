import type { Editor } from "@tiptap/core";
import { splitContentByMentions } from "@standin/contracts";
import type { InlineNode } from "../types";
import { MENTION_NODE_NAME } from "./mention";

const LINE_BREAK = "\n";

const toLineNodes = (line: string): InlineNode[] => {
    if (line.length === 0) return [];
    return [{ type: "text", text: line }];
};

const toLinesNodes = (text: string): InlineNode[] =>
    text.split(LINE_BREAK).flatMap((line, index): InlineNode[] => {
        const lineNodes = toLineNodes(line);
        if (index === 0) return lineNodes;
        return [{ type: "hardBreak" }, ...lineNodes];
    });

// A message is one paragraph: every line break is a hard break, so the text
// that goes out is the text that was typed. A mention link becomes a mention.
export const textToInline = (text: string): InlineNode[] =>
    splitContentByMentions(text.replace(/\r\n?/g, LINE_BREAK)).flatMap(
        (part): InlineNode[] => {
            if (part.type === "text") return toLinesNodes(part.text);
            return [
                {
                    type: MENTION_NODE_NAME,
                    attrs: { id: part.userId, label: part.label },
                },
            ];
        }
    );

export const textToDoc = (text: string) => ({
    type: "doc",
    content: [{ type: "paragraph", content: textToInline(text) }],
});

type MarkdownStorage = { getMarkdown: () => string };

export const getMarkdown = (editor: Editor): string =>
    (
        editor.storage as unknown as { markdown: MarkdownStorage }
    ).markdown.getMarkdown();
