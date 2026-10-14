import { FloatingPanel } from "@/components/editor/FloatingPanel";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { MAP_EDITOR_KEYS } from "@/features/maps/__shared__/consts/editorKeys";
import { useEditorZoom } from "@/features/maps/__shared__/hooks/useEditorZoom";

type EditorZoomProps = {
    onFit: () => void;
};

// The zoom floating on the bottom right of the canvas, like the one of the
// tile editor. Pressing the zoom in use fits the map to the view.
export const EditorZoom = ({ onFit }: EditorZoomProps) => {
    const zoom = useEditorZoom();

    return (
        <FloatingPanel className="text-muted-foreground right-3 bottom-3 p-1 text-xs">
            <ZoomControls
                zoom={zoom.zoom}
                canZoomIn={zoom.canZoomIn}
                canZoomOut={zoom.canZoomOut}
                onZoomIn={zoom.zoomIn}
                onZoomOut={zoom.zoomOut}
                onReset={onFit}
                resetLabel="Ajustar ao mapa"
                zoomInShortcut={MAP_EDITOR_KEYS.ZOOM_IN[0]}
                zoomOutShortcut={MAP_EDITOR_KEYS.ZOOM_OUT[0]}
                resetShortcut={MAP_EDITOR_KEYS.FIT[0]}
            />
        </FloatingPanel>
    );
};
