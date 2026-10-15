import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileStatusOverlay } from "../../views/editor/status/Status";

// What floats over the bottom of the sheet (what is under the pointer, the
// zoom), read from the editor.
export const TileEditorStatus = () => {
    const editor = useTileEditorContext();

    return (
        <TileStatusOverlay
            grid={editor.grid}
            meta={editor.meta}
            hovered={editor.hovered}
            selectedCount={editor.selected.length}
            zoom={editor.zoom}
            onZoomChange={editor.setZoom}
        />
    );
};
