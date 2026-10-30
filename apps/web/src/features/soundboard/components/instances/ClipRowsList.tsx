import { useClipList } from "../../hooks/useClipList";
import type { ClipListLayout } from "../../types/layout";
import type {
    TileActionsComponent,
    TileOverlayComponent,
} from "../../types/tile";
import { ListHeaderFrame } from "../views/list/ListHeaderFrame";
import { ScrollFrame } from "../views/list/ScrollFrame";
import { VirtualClipRow } from "./VirtualClipRow";

type Props = {
    search: string;
    hasSearch: boolean;
    // How the clips are shown: tiles, a table or cards.
    layout: ClipListLayout;
    Overlay: TileOverlayComponent;
    Actions: TileActionsComponent;
};

// The clips of the groups in one scrolling list. Only the rows on screen are
// mounted, so a library of any size stays fast, and folding a group animates
// because its rows stay in the list with no height. The layout decides how a
// line of clips looks and how tall it is, and what sits above the rows.
export const ClipRowsList = ({
    search,
    hasSearch,
    layout,
    Overlay,
    Actions,
}: Props) => {
    const list = useClipList({ search, hasSearch, layout });

    return (
        <div className="flex min-w-0 flex-col">
            <ListHeaderFrame>
                <layout.Header widthPx={list.widthPx} />
            </ListHeaderFrame>
            <ScrollFrame
                setElement={list.setScrollElement}
                totalSize={list.totalSize}
            >
                {list.virtualRows.map((virtualRow) => (
                    <VirtualClipRow
                        key={virtualRow.key}
                        start={virtualRow.start}
                        tilesRowHeight={list.tilesRowHeight}
                        row={list.rows[virtualRow.index]}
                        columns={list.columns}
                        layout={layout}
                        widthPx={list.widthPx}
                        Overlay={Overlay}
                        Actions={Actions}
                        onToggleGroup={list.toggleGroup}
                        onRetry={list.retry}
                    />
                ))}
            </ScrollFrame>
        </div>
    );
};
