import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import type { ScreenRect } from "@/features/editor/types/screen-rect";

// What the decorator needs from the page that opens it: the stores that hold
// the tool and the draft, and where to tell the hint line and the place of the
// selected object on the page.
export type DecoratorModeOptions = {
    store: EditorStore;
    draftStore: DraftStore;
    // Who decorates, and how to name the owner of a desk. A desk claimed by
    // someone else, and what is on it, cannot be touched.
    userId: string;
    getUserName: (userId: string) => string | null;
    // The object to select and bring into view when the decorator opens, such
    // as the desk of the person.
    focusId?: string | null;
    onHint?: (text: string | null) => void;
    onSelectionAnchor?: (anchor: ScreenRect | null) => void;
};
