import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileToolSwitch } from "../../views/editor/tools/Switch";

// The tools on the right edge, read from the editor.
export const TileEditorToolbar = () => {
    const editor = useTileEditorContext();

    return (
        <TileToolSwitch
            tool={editor.tool}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            onToolChange={editor.setTool}
            onUndo={editor.undo}
            onRedo={editor.redo}
        />
    );
};
