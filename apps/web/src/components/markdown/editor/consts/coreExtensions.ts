import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { UndoRedo } from "@tiptap/extensions";
import { Markdown } from "tiptap-markdown";
import { Mention } from "../extensions/Mention";
import { MessageHardBreak, MessageText } from "./messageNodes";

// One paragraph of plain text: no marks and no blocks, so what is typed is
// what is stored. The markdown serializer stays for the nodes that serialize
// to markdown on their own (mentions).
export const createCoreExtensions = () => [
    Document,
    Paragraph,
    MessageText,
    MessageHardBreak,
    Mention,
    UndoRedo,
    Markdown.configure({
        html: false,
        transformPastedText: false,
        transformCopiedText: false,
    }),
];
