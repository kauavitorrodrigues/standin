import type { Cell } from "@standin/contracts";
import type { ZoneDrag } from "@/features/editor/types/ZoneDrag";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { moveZoneRect } from "@/features/editor/utils/moveZoneRect";
import { resizeZoneRect } from "@/features/editor/utils/resizeZoneRect";

type Params = {
    drag: ZoneDrag;
    cell: Cell;
    columns: number;
    rows: number;
};

// Where the dragged zone would land with the pointer on this cell.
export const getZoneDragRect = ({
    drag,
    cell,
    columns,
    rows,
}: Params): ZoneRect => {
    switch (drag.mode) {
        case "move":
            return moveZoneRect({
                rect: drag.rect,
                delta: [cell[0] - drag.from[0], cell[1] - drag.from[1]],
                columns,
                rows,
            });
        case "resize":
            return resizeZoneRect({
                rect: drag.rect,
                handle: drag.handle,
                cell,
                columns,
                rows,
            });
    }
};
