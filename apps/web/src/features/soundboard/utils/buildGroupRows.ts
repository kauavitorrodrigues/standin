import type { ClipGroup, ClipRow, ClipStateKind } from "../types/row";
import { chunk } from "@/utils/chunk";
import { resolveGroupVisibility } from "./resolveGroupVisibility";

type Input = {
    group: ClipGroup;
    columns: number;
    isOpen: boolean;
    // Whether the group has a header row. Without one it is rows alone.
    showHeader: boolean;
};

const stateRow = (
    group: ClipGroup,
    state: ClipStateKind,
    isCollapsed = false
): ClipRow => ({
    kind: "state",
    key: `${group.scope}:${state}`,
    scope: group.scope,
    state,
    isCollapsed,
});

// The header of a group, or nothing when the list has no headers.
const buildHeaderRows = (
    group: ClipGroup,
    isOpen: boolean,
    showHeader: boolean
): ClipRow[] => {
    if (!showHeader) return [];
    return [
        {
            kind: "header",
            key: `${group.scope}:header`,
            scope: group.scope,
            label: group.label,
            isOpen,
        },
    ];
};

/**
 * The rows of one group. A group not known to have clips yet is only its
 * loading or error row, with no header. A group known to have none has no
 * rows. Otherwise its header (when it has one), and below it its tiles in
 * lines of `columns` with a row at the end while more pages are to come. A folded group keeps
 * those rows, flagged, so that folding moves them instead of dropping them.
 */
export const buildGroupRows = ({
    group,
    columns,
    isOpen,
    showHeader,
}: Input): ClipRow[] => {
    const visibility = resolveGroupVisibility(group);
    if (visibility === "hidden") return [];
    if (visibility === "unknown") {
        return [stateRow(group, group.isLoading ? "loading" : "error")];
    }

    const header = buildHeaderRows(group, isOpen, showHeader);

    const isCollapsed = !isOpen;
    const lines: ClipRow[] = chunk(group.clips, columns).map(
        (clips, index) => ({
            kind: "tiles",
            key: `${group.scope}:tiles:${index}`,
            scope: group.scope,
            clips,
            isCollapsed,
        })
    );
    if (!group.hasNextPage) return [...header, ...lines];
    if (group.isNextPageError) {
        return [
            ...header,
            ...lines,
            stateRow(group, "more-error", isCollapsed),
        ];
    }
    return [...header, ...lines, stateRow(group, "more", isCollapsed)];
};
