import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { shouldSubmit } from "../consts/submitKey";

type SubmitOnEnterOptions = {
    onSubmit: () => void;
};

// Above the Enter of the editor core (100), which splits the paragraph, and
// below the suggestion lists (200), which take Enter while they are open.
export const SubmitOnEnter = Extension.create<SubmitOnEnterOptions>({
    name: "submitOnEnter",
    priority: 150,

    addOptions() {
        return { onSubmit: () => undefined };
    },

    addProseMirrorPlugins() {
        const options = this.options;
        return [
            new Plugin({
                key: new PluginKey("submitOnEnter"),
                props: {
                    handleKeyDown: (_view, event) => {
                        if (!shouldSubmit(event)) return false;
                        event.preventDefault();
                        options.onSubmit();
                        return true;
                    },
                },
            }),
        ];
    },
});
