import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TileSheetCanvas } from "../../views/editor/sheet/Canvas";

// The sheet, read from the editor.
export const TileEditorCanvas = () => {
    const editor = useTileEditorContext();

    return (
        <TileSheetCanvas
            url={editor.url}
            grid={editor.grid}
            meta={editor.meta}
            zoom={editor.zoom}
            selected={editor.selected}
            hovered={editor.hovered}
            filter={editor.filter}
            topTile={editor.selectedEntry?.top ?? null}
            preview={editor.preview}
            panMode={editor.panMode}
            isLocked={(index) => !editor.canEdit(index)}
            scrollRef={editor.scrollRef}
            pointerHandlers={editor.pointerHandlers}
        />
    );
};
