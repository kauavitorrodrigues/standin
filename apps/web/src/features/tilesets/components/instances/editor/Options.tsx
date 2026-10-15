import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileContextBar } from "../../views/editor/tools/ContextBar";

// The bar over the sheet with the options of the tool in use, read from the
// editor.
export const TileEditorOptions = () => {
    const editor = useTileEditorContext();

    return (
        <TileContextBar
            tool={editor.tool}
            contiguous={editor.contiguous}
            onContiguousChange={editor.setContiguous}
        />
    );
};
