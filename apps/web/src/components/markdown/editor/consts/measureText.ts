import type { Fragment, Node as ProseNode } from "@tiptap/pm/model";
import { formatMentionLink } from "@standin/contracts";
import { MENTION_NODE_NAME } from "./mention";

const LINE_BREAK = "\n";

// A mention is stored as a link, so that is what counts toward the limit
// and not the short chip the person sees.
const leafToText = (node: ProseNode): string => {
    if (node.type.name !== MENTION_NODE_NAME) return LINE_BREAK;
    return formatMentionLink(node.attrs.label, node.attrs.id);
};

export const storedFragmentText = (fragment: Fragment): string =>
    fragment.textBetween(0, fragment.size, LINE_BREAK, leafToText);

// The stored text of a part of the document.
export const storedText = (doc: ProseNode, from: number, to: number): string =>
    doc.textBetween(from, to, LINE_BREAK, leafToText);

export const storedLength = (doc: ProseNode): number =>
    storedText(doc, 0, doc.content.size).length;
