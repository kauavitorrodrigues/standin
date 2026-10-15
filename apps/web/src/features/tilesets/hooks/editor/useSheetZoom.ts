import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { useAsRef } from "@/hooks/useAsRef";
import { TILE_SHEET_TOP_GAP_PX, type TileZoom } from "../../consts/sheetZoom";
import { getWheelDirection } from "@/utils/getWheelDirection";
import { getFitZoom } from "../../utils/editor/getFitZoom";
import { getNextTileZoom } from "../../utils/editor/getNextTileZoom";
import { getSheetElement } from "../../utils/editor/getSheetElement";

type Params = {
    scrollRef: RefObject<HTMLDivElement | null>;
    zoom: TileZoom;
    // The width of the sheet in px, at 1x.
    sheetWidthPx: number;
    onZoomChange: (zoom: TileZoom) => void;
};

// The point of the sheet under the pointer, in px of the image, and where on
// the screen the pointer is. It is what stays still while the zoom changes.
type Anchor = {
    imageX: number;
    imageY: number;
    clientX: number;
    clientY: number;
};

// Scrolls so the sheet is in the middle of the area from side to side, and a
// little below its top. The sheet does not start at the corner, since there is
// room around it to pan into.
const centerSheet = (scroller: HTMLDivElement) => {
    const sheet = getSheetElement(scroller);
    if (!sheet) return;
    const area = scroller.getBoundingClientRect();
    const rect = sheet.getBoundingClientRect();
    scroller.scrollLeft +=
        rect.left + rect.width / 2 - (area.left + scroller.clientWidth / 2);
    scroller.scrollTop += rect.top - (area.top + TILE_SHEET_TOP_GAP_PX);
};

// The wheel over the sheet zooms it, toward the pointer, instead of scrolling
// it. With Ctrl it moves the sheet up and down, and with Shift from side to
// side, and a drag moves it too, with the pan.
export const useTileSheetZoom = ({
    scrollRef,
    zoom,
    sheetWidthPx,
    onZoomChange,
}: Params) => {
    const zoomRef = useAsRef(zoom);
    const sheetWidthRef = useAsRef(sheetWidthPx);
    const onZoomChangeRef = useAsRef(onZoomChange);
    const anchor = useRef<Anchor | null>(null);
    const turned = useRef(0);

    // The sheet opens at a zoom that fits the width of the area. The area has no
    // width until the panels are laid out, so it waits for the first one.
    useEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;

        const observer = new ResizeObserver(() => {
            if (scroller.clientWidth === 0) return;
            onZoomChangeRef.current(
                getFitZoom(sheetWidthRef.current, scroller.clientWidth)
            );
            observer.disconnect();
            // Once the new zoom is on the screen.
            requestAnimationFrame(() => centerSheet(scroller));
        });
        observer.observe(scroller);
        return () => observer.disconnect();
    }, [scrollRef, sheetWidthRef, onZoomChangeRef]);

    useEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;

        // Not passive, so the page does not scroll under the zoom.
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            // Ctrl moves the sheet up and down, and Shift from side to side. Some
            // browsers turn the wheel with Shift into a horizontal one already.
            if (event.ctrlKey || event.metaKey) {
                scroller.scrollTop += event.deltaY;
                return;
            }
            if (event.shiftKey) {
                scroller.scrollLeft += event.deltaX || event.deltaY;
                return;
            }
            turned.current += event.deltaY;
            const direction = getWheelDirection(turned.current);
            if (direction === 0) return;

            turned.current = 0;
            const next = getNextTileZoom(zoomRef.current, direction);
            const sheet = getSheetElement(scroller);
            if (next === zoomRef.current || !sheet) return;

            const rect = sheet.getBoundingClientRect();
            anchor.current = {
                imageX: (event.clientX - rect.left) / zoomRef.current,
                imageY: (event.clientY - rect.top) / zoomRef.current,
                clientX: event.clientX,
                clientY: event.clientY,
            };
            onZoomChangeRef.current(next);
        };

        scroller.addEventListener("wheel", handleWheel, { passive: false });
        return () => scroller.removeEventListener("wheel", handleWheel);
    }, [scrollRef, zoomRef, onZoomChangeRef]);

    // A zoom that does not come from the wheel (the buttons) keeps the middle of
    // what is in sight where it is.
    const zoomAtCenter = (next: TileZoom) => {
        const scroller = scrollRef.current;
        const sheet = scroller ? getSheetElement(scroller) : null;
        if (scroller && sheet) {
            const area = scroller.getBoundingClientRect();
            const rect = sheet.getBoundingClientRect();
            const clientX = area.left + scroller.clientWidth / 2;
            const clientY = area.top + scroller.clientHeight / 2;
            anchor.current = {
                imageX: (clientX - rect.left) / zoomRef.current,
                imageY: (clientY - rect.top) / zoomRef.current,
                clientX,
                clientY,
            };
        }
        onZoomChangeRef.current(next);
    };

    // Once the sheet has its new size, scrolls so the same point of the image
    // is under the pointer again.
    useLayoutEffect(() => {
        const current = anchor.current;
        const scroller = scrollRef.current;
        const sheet = scroller ? getSheetElement(scroller) : null;
        anchor.current = null;
        if (!current || !scroller || !sheet) return;

        const rect = sheet.getBoundingClientRect();
        scroller.scrollLeft +=
            rect.left + current.imageX * zoom - current.clientX;
        scroller.scrollTop +=
            rect.top + current.imageY * zoom - current.clientY;
    }, [zoom, scrollRef]);

    return { zoomAtCenter };
};
