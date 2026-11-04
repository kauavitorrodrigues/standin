import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { clipToLimit } from "../consts/limit";
import { storedLength, storedText } from "../consts/measureText";
import { textToInline } from "../consts/plainText";

type LimitLengthOptions = {
    max: number;
};

const LINE_BREAK = "\n";

// Typing past the limit is refused and a paste is cut at it, like the
// maxLength of a textarea. A line break counts as one character.
export const LimitLength = Extension.create<LimitLengthOptions>({
    name: "limitLength",

    addOptions() {
        return { max: Number.MAX_SAFE_INTEGER };
    },

    addProseMirrorPlugins() {
        const { max } = this.options;
        return [
            new Plugin({
                key: new PluginKey("limitLength"),
                filterTransaction: (transaction, state) => {
                    if (!transaction.docChanged) return true;
                    const length = storedLength(transaction.doc);
                    if (length <= max) return true;
                    // Cutting text is always allowed, so a long stored message can still be edited.
                    return length <= storedLength(state.doc);
                },
                props: {
                    // Pasting is always plain text, whatever the clipboard holds.
                    handlePaste: (view, event) => {
                        const pasted =
                            event.clipboardData?.getData("text/plain") ?? "";
                        if (pasted.length === 0) return false;
                        const { state } = view;
                        const { from, to } = state.selection;
                        const current = storedLength(state.doc);
                        const selected = storedText(state.doc, from, to).length;
                        const text = clipToLimit(
                            pasted.replace(/\r\n?/g, LINE_BREAK),
                            current,
                            selected,
                            max
                        );
                        event.preventDefault();
                        if (text.length === 0) return true;
                        const nodes = textToInline(text).map((node) =>
                            state.schema.nodeFromJSON(node)
                        );
                        view.dispatch(
                            state.tr
                                .replaceWith(from, to, nodes)
                                .scrollIntoView()
                        );
                        return true;
                    },
                },
            }),
        ];
    },
});
