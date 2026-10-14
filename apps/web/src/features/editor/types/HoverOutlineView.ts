import type { EditorModel } from "@standin/contracts";

// The hover mark as the select tool sees it. The Phaser class implements it
// and the tests use a fake.
export type HoverOutlineView = {
    // Outlines the placed object and turns the cursor into a pointer.
    show: (model: Readonly<EditorModel>, id: string) => void;
    hide: () => void;
    destroy: () => void;
};
