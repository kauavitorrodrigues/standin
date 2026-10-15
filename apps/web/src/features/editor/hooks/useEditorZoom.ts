import { ZOOM_LEVELS } from "@standin/contracts";
import { EDITOR_ZOOM_DIRECTIONS } from "@/features/editor/consts/camera";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { getNextZoom } from "@/features/editor/utils/getNextZoom";

// The zoom of the editor and the steps the buttons give it. The scene follows
// the store, so setting the zoom there is enough.
export const useEditorZoom = () => {
    const store = useEditorStore();
    const zoom = useEditorSelector((state) => state.zoom);

    return {
        zoom,
        canZoomIn: zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1]!,
        canZoomOut: zoom > ZOOM_LEVELS[0],
        zoomIn: () =>
            store.setZoom(getNextZoom(zoom, EDITOR_ZOOM_DIRECTIONS.IN)),
        zoomOut: () =>
            store.setZoom(getNextZoom(zoom, EDITOR_ZOOM_DIRECTIONS.OUT)),
    };
};
