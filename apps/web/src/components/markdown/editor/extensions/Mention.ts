import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { formatMentionLink } from "@standin/contracts";
import { storedFragmentText } from "../consts/measureText";
import { MENTION_CHIP_CLASS, MENTION_NODE_NAME } from "../consts/mention";
import type { MentionAttrs, SerializerState } from "../types";

// A person picked from the list: one atomic piece in the field that is
// stored as the link `[@Name](mention:<userId>)`, which is what the server
// reads the ids from.
export const Mention = Node.create({
    name: MENTION_NODE_NAME,
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,

    // The attributes stay out of the DOM except for data-mention-id, so two
    // chips of the same person do not repeat an id of the page.
    addAttributes() {
        return {
            id: {
                default: "",
                rendered: false,
                parseHTML: (element) =>
                    element.getAttribute("data-mention-id") ?? "",
            },
            label: {
                default: "",
                rendered: false,
                parseHTML: (element) => element.textContent ?? "",
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[data-mention-id]" }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                "data-mention-id": node.attrs.id,
                class: MENTION_CHIP_CLASS,
            }),
            node.attrs.label,
        ];
    },

    renderText({ node }) {
        return node.attrs.label;
    },

    // Cut and copy write the links, so pasting them brings the chips back
    // instead of a plain "@Name" that notifies nobody.
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("mentionClipboard"),
                props: {
                    clipboardTextSerializer: (slice) =>
                        storedFragmentText(slice.content),
                },
            }),
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize(
                    state: SerializerState,
                    node: { attrs: MentionAttrs }
                ) {
                    state.write(
                        formatMentionLink(node.attrs.label, node.attrs.id)
                    );
                },
                parse: {},
            },
        };
    },
});
