import type { ReactNode } from "react";
import {
    EditorViewControls,
    type EditorViewControlsProps,
} from "./EditorViewControls";

type Props = EditorViewControlsProps & {
    // What goes on the left of the row: the chips of the editor, or tabs.
    leading: ReactNode;
};

// The row above the image of every editor: what is being marked on the left,
// the view controls on the right.
export const EditorToolbar = ({ leading, ...controls }: Props) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
        {leading}
        <EditorViewControls {...controls} />
    </div>
);
