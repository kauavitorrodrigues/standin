import type { ClipRowViewProps } from "../../../types/row";
import { PanelStateRowView } from "./PanelStateRow";
import { GroupHeader } from "./GroupHeader";
import { ClipStateRowView } from "./StateRow";

// The content of one row of the virtual list, by what kind of row it is. A
// line of tiles is drawn by the layout, the way the clips are shown.
export const ClipRowView = ({
    row,
    columns,
    layout,
    widthPx,
    Overlay,
    Actions,
    onToggleGroup,
    onRetry,
}: ClipRowViewProps) => {
    if (row === undefined) return null;

    switch (row.kind) {
        case "header":
            return (
                <GroupHeader
                    row={row}
                    onToggle={() => onToggleGroup(row.scope)}
                />
            );
        case "tiles":
            return (
                <layout.TilesRow
                    row={row}
                    columns={columns}
                    widthPx={widthPx}
                    Overlay={Overlay}
                    Actions={Actions}
                />
            );
        case "panel":
            return <PanelStateRowView row={row} />;
        case "state":
            return (
                <ClipStateRowView
                    row={row}
                    onRetry={() => onRetry(row.scope)}
                />
            );
    }
};
