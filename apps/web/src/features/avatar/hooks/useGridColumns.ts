import { useEffect, useState } from "react";
import { PART_GRID_MAX_COLUMNS } from "../consts/editor/grid";
import { getGridColumns } from "../utils/gridColumns";

// How many tiles a row of the grid holds, following the width of the scroll
// area of the grid. It starts at the maximum until the area is measured.
export const useGridColumns = (element: HTMLElement | null): number => {
    const [columns, setColumns] = useState(PART_GRID_MAX_COLUMNS);

    useEffect(() => {
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            setColumns(getGridColumns(entry.contentRect.width));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    return columns;
};
