import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileBrushRail } from "../../views/editor/brush/Rail";

// The category and the solid of what is painted, read from the editor.
export const TileEditorBrush = () => {
    const editor = useTileEditorContext();

    return (
        <TileBrushRail
            tool={editor.tool}
            brush={editor.brush}
            solid={editor.brushSolid}
            disabled={editor.disabled}
            onBrushChange={editor.chooseCategory}
            onSolidChange={editor.chooseSolid}
        />
    );
};
