import type { BuildClipRowsInput, ClipRow } from "../types/row";
import { buildGroupRows } from "./buildGroupRows";
import { resolvePanelState } from "./resolvePanelState";

/**
 * The flat list of rows the virtual list shows. When no group has a clip, one
 * row says why. Otherwise, for each group in order, its header (when the list
 * has them) followed by its tile lines or its state. A list with no headers is
 * rows alone, and a closed group keeps its rows at no height.
 */
export const buildClipRows = ({
    groups,
    columns,
    collapsed,
    hasSearch,
    showGroupHeaders,
}: BuildClipRowsInput): ClipRow[] => {
    const panelState = resolvePanelState(groups, hasSearch);
    if (panelState !== "groups") {
        return [
            { kind: "panel", key: `panel:${panelState}`, state: panelState },
        ];
    }

    return groups.flatMap((group) =>
        buildGroupRows({
            group,
            columns,
            // A list without headers has nothing to fold.
            isOpen: !showGroupHeaders || !collapsed.has(group.scope),
            showHeader: showGroupHeaders,
        })
    );
};
