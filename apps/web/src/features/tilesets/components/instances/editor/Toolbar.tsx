import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileToolSwitch } from "../../views/editor/tools/Switch";

type Props = {
    onRemoveImage?: () => void;
};

// The tools on the right edge, read from the editor.
export const TileEditorToolbar = ({ onRemoveImage }: Props) => {
    const editor = useTileEditorContext();

    return (
        <TileToolSwitch
            tool={editor.tool}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            disabled={editor.disabled}
            onRemoveImage={onRemoveImage}
            onToolChange={editor.setTool}
            onUndo={editor.undo}
            onRedo={editor.redo}
        />
    );
};
