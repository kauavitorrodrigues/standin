import { HardBreak } from "@tiptap/extension-hard-break";
import { Text } from "@tiptap/extension-text";
import type { SerializedTextNode, SerializerState } from "../types";

// The markdown serializer escapes text and writes a backslash before a line
// break. Messages are stored exactly as typed, so both are written as is.
export const MessageText = Text.extend({
    addStorage() {
        return {
            markdown: {
                serialize(state: SerializerState, node: SerializedTextNode) {
                    state.text(node.text ?? "", false);
                },
                parse: {},
            },
        };
    },
});

export const MessageHardBreak = HardBreak.extend({
    addKeyboardShortcuts() {
        return { "Shift-Enter": () => this.editor.commands.setHardBreak() };
    },
    addStorage() {
        return {
            markdown: {
                serialize(state: SerializerState) {
                    state.write("\n");
                },
                parse: {},
            },
        };
    },
});
