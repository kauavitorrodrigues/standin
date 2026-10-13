import type { ReactNode } from "react";
import type { EditorMode } from "../../../consts/editorModes";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { EditorHelpDialog } from "./EditorHelpDialog";
import { EditorModeChips } from "./EditorModeChips";

type Props = {
    // What a dialog that holds more than one editor puts here instead of the
    // chips, like its tabs.
    custom: ReactNode;
    crop: Crop;
    footprint: Footprint;
    solid: boolean;
    mode: EditorMode;
    footprintOnly: boolean;
    onModeChange: (mode: EditorMode) => void;
};

// The left of the toolbar of the sprite editor: the chips that say what is
// being marked, or what the dialog put there.
export const SpriteEditorLeading = ({ custom, ...chips }: Props) => {
    if (custom) return <>{custom}</>;

    return (
        <div className="flex items-center gap-1">
            <EditorModeChips {...chips} />
            <EditorHelpDialog />
        </div>
    );
};
