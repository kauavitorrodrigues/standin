import { ToolOptionsAnchor } from "@/features/editor/components/layout/ToolOptionsAnchor";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileEditorBrush } from "./Brush";
import { TileEditorOptions } from "./Options";

// The brush and the options of the tool, beside the toolbar.
export const TileEditorToolOptions = () => {
    const { tool } = useTileEditorContext();

    return (
        <ToolOptionsAnchor anchorId={tool}>
            <TileEditorBrush />
            <TileEditorOptions />
        </ToolOptionsAnchor>
    );
};
