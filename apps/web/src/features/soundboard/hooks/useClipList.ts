import { useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SoundboardClipScope } from "@standin/contracts";
import type { ClipListLayout } from "../types/layout";
import { SOUNDBOARD_ROW_OVERSCAN } from "../consts/grid";
import { buildClipRows } from "../utils/buildClipRows";
import { findScopesToFetch } from "../utils/findScopesToFetch";
import { getRowHeight } from "../utils/getRowHeight";
import { useClipGroups } from "./useClipGroups";
import { useCollapsedGroups } from "./useCollapsedGroups";
import { useSoundboardLibrary } from "./useSoundboardLibrary";
import { useElementWidth } from "./useElementWidth";

type Options = {
    search: string;
    hasSearch: boolean;
    // How the clips are shown: it decides the columns and how tall a line is.
    layout: ClipListLayout;
};

/**
 * The grouped list as a virtual list of rows: group headers and lines of tiles
 * in one flat list, so a library of any size mounts only what is on screen.
 * The column count and the height of a line follow the way the clips are shown
 * (the layout) and the real width of the list, and the next page of a group is
 * asked for as its last rows come close.
 */
export const useClipList = ({ search, hasSearch, layout }: Options) => {
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
        null
    );
    const { showGroupHeaders } = useSoundboardLibrary();
    const groups = useClipGroups(search);
    const { collapsed, toggle } = useCollapsedGroups();
    const widthPx = useElementWidth(scrollElement);
    const columns = layout.getColumnCount(widthPx);
    const tilesRowHeight = layout.getTilesRowHeight(widthPx, columns);

    const rows = buildClipRows({
        groups,
        columns,
        collapsed,
        hasSearch,
        showGroupHeaders,
    });

    // The virtualizer is not memoizable by the compiler, and nothing here
    // relies on it being.
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: (index) => getRowHeight(rows[index], tilesRowHeight),
        getItemKey: (index) => rows[index]?.key ?? index,
        getScrollElement: () => scrollElement,
        overscan: SOUNDBOARD_ROW_OVERSCAN,
    });
    const virtualRows = virtualizer.getVirtualItems();
    const lastVisibleIndex = virtualRows.at(-1)?.index ?? -1;

    useEffect(() => {
        findScopesToFetch(rows, lastVisibleIndex).forEach((scope) => {
            const group = groups.find((candidate) => candidate.scope === scope);
            if (!group || group.isFetchingNextPage) return;
            group.fetchNextPage();
        });
    }, [rows, lastVisibleIndex, groups]);

    const retry = (scope: SoundboardClipScope) =>
        groups.find((group) => group.scope === scope)?.refetch();

    return {
        setScrollElement,
        rows,
        columns,
        widthPx,
        tilesRowHeight,
        virtualRows,
        totalSize: virtualizer.getTotalSize(),
        toggleGroup: toggle,
        retry,
    };
};
