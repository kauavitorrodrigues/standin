import type { RefObject } from "react";
import type { TileZoom } from "../../consts/sheetZoom";
import type { TileSheetGrid } from "../../types/sheet";
import { getSheetElement } from "../../utils/editor/getSheetElement";
import { getTileOrigin } from "../../utils/editor/getOrigin";

type Params = {
    scrollRef: RefObject<HTMLDivElement | null>;
    zoom: TileZoom;
    grid: TileSheetGrid;
};

// Scrolls the sheet so a tile ends up in the middle of what is in sight. The
// sheet does not start at the corner of the area (there is room around it), so
// where it starts is read from the page.
export const useRevealTile = ({ scrollRef, zoom, grid }: Params) => {
    return (index: number) => {
        const element = scrollRef.current;
        const sheet = element ? getSheetElement(element) : null;
        if (!element || !sheet) return;
        const area = element.getBoundingClientRect();
        const rect = sheet.getBoundingClientRect();
        const sheetLeft = rect.left - area.left + element.scrollLeft;
        const sheetTop = rect.top - area.top + element.scrollTop;
        const { x, y } = getTileOrigin(index, grid);
        element.scrollTo({
            left: sheetLeft + x * zoom - element.clientWidth / 2,
            top: sheetTop + y * zoom - element.clientHeight / 2,
            behavior: "smooth",
        });
    };
};
