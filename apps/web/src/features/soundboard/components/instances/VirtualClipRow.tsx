import { useRetainedWhileCollapsing } from "../../hooks/useRetainedWhileCollapsing";
import type { ClipRowViewProps } from "../../types/row";
import { getRowHeight } from "../../utils/getRowHeight";
import { isRowCollapsed } from "../../utils/isRowCollapsed";
import { ClipRowView } from "../views/list/Row";
import { VirtualRowFrame } from "../views/list/VirtualRowFrame";

type Props = ClipRowViewProps & { start: number; tilesRowHeight: number };

// One row of the virtual list. A row of a folded group stays in the list at no
// height, drawn only while it is folding. One that was folded from the start is
// not drawn at all, however many there are.
export const VirtualClipRow = ({ start, tilesRowHeight, ...view }: Props) => {
    const collapsed = isRowCollapsed(view.row);
    const retained = useRetainedWhileCollapsing(collapsed);
    if (!retained) return null;

    return (
        <VirtualRowFrame
            start={start}
            height={getRowHeight(view.row, tilesRowHeight)}
            collapsed={collapsed}
        >
            <ClipRowView {...view} />
        </VirtualRowFrame>
    );
};
