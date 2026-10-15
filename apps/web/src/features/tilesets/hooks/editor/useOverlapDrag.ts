import { useRef, type PointerEvent } from "react";
import { getOverlapFromPointer } from "../../utils/editor/wall/getOverlapFromPointer";
import { useTileEditorContext } from "./useEditorContext";

// The line that says how many rows of the wall tile cover an avatar behind
// it. Pressing the tile puts the line there and dragging moves it, in whole
// rows. The drag is one step of the history.
export const useOverlapDrag = (drawnHeightPx: number) => {
    const { wall } = useTileEditorContext();
    const dragging = useRef(false);

    const read = (event: PointerEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        wall.setOverlap(
            getOverlapFromPointer(event.clientY - rect.top, drawnHeightPx)
        );
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        wall.beginStroke();
        read(event);
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (!dragging.current) return;
        read(event);
    };

    const onPointerUp = () => {
        if (!dragging.current) return;
        dragging.current = false;
        wall.endStroke();
    };

    return { onPointerDown, onPointerMove, onPointerUp };
};
