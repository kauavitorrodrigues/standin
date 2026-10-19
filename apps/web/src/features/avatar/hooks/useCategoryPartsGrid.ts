import { useEffect, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { AvatarSlot } from "@standin/contracts";
import {
    PART_GRID_OVERSCAN,
    PART_GRID_ROW_HEIGHT,
} from "../consts/editor/grid";
import { useCategoryParts } from "../queries/useCategoryParts";
import { chunkRows } from "../utils/chunkRows";

// The parts of a category as a virtual list of rows. Only the rows near the
// viewport are mounted, and the next page is asked for when the last row gets
// close, with no button. A page that failed is not asked again by itself.
export const useCategoryPartsGrid = (
    slot: AvatarSlot,
    scrollElement: HTMLDivElement | null,
    columns: number
) => {
    const query = useCategoryParts(slot);
    const { items, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
        query;

    const rows = useMemo(() => chunkRows(items, columns), [items, columns]);
    // One more row after the last one while there are pages to come.
    const rowCount = hasNextPage ? rows.length + 1 : rows.length;

    const virtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => scrollElement,
        estimateSize: () => PART_GRID_ROW_HEIGHT,
        overscan: PART_GRID_OVERSCAN,
    });

    const virtualRows = virtualizer.getVirtualItems();
    const lastIndex = virtualRows.at(-1)?.index ?? -1;
    const { fetchNextPage } = query;

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
        if (lastIndex < rows.length - 1) return;
        void fetchNextPage();
    }, [
        hasNextPage,
        isFetchingNextPage,
        isFetchNextPageError,
        lastIndex,
        rows.length,
        fetchNextPage,
    ]);

    return {
        items,
        rows,
        virtualRows,
        totalSize: virtualizer.getTotalSize(),
        isPending: query.isPending,
        isError: query.isError && items.length === 0,
        isLoadingMore: isFetchingNextPage,
        isNextPageError: isFetchNextPageError,
        isListComplete: query.isSuccess && !hasNextPage,
        refetch: query.refetch,
        fetchNextPage,
    };
};
