import { useEffect, useRef, type RefObject } from "react";
import type { Zoom } from "../consts/editorZoom";
import { WHEEL_ZOOM_INTERVAL_MS } from "../consts/wheelZoom";
import { getZoomStep } from "../utils/getZoomStep";

// Marks the element of the stage that scrolls, so the wheel only zooms when
// there is nothing left to scroll.
export const SCROLL_AREA_ATTRIBUTE = "data-editor-scroll";

const isScrollable = (element: Element) =>
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth;

// Zoom with the wheel inside the stage, so it does not zoom the page of the
// browser. Ctrl or Cmd with the wheel (what a trackpad pinch sends) always
// zooms. The wheel alone zooms while the image fits in the area, and scrolls
// it once it does not.
export const useWheelZoom = (
    ref: RefObject<HTMLElement | null>,
    zoom: Zoom,
    onZoomChange: (zoom: Zoom) => void
) => {
    const latest = useRef({ zoom, onZoomChange });
    const lastChange = useRef(0);
    useEffect(() => {
        latest.current = { zoom, onZoomChange };
    });

    useEffect(() => {
        const stage = ref.current;
        if (!stage) return;

        const onWheel = (event: WheelEvent) => {
            const scrollArea = stage.querySelector(
                `[${SCROLL_AREA_ATTRIBUTE}]`
            );
            const withModifier = event.ctrlKey || event.metaKey;
            if (!withModifier && scrollArea && isScrollable(scrollArea)) return;

            event.preventDefault();
            if (event.timeStamp - lastChange.current < WHEEL_ZOOM_INTERVAL_MS) {
                return;
            }
            const direction = event.deltaY < 0 ? 1 : -1;
            const next = getZoomStep(latest.current.zoom, direction);
            if (!next) return;
            lastChange.current = event.timeStamp;
            latest.current.onZoomChange(next);
        };

        stage.addEventListener("wheel", onWheel, { passive: false });
        return () => stage.removeEventListener("wheel", onWheel);
    }, [ref]);
};
