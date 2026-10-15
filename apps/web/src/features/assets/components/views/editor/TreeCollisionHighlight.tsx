import {
    TREE_CELL_PX,
    TREE_TILE_PX,
    TREE_TRUNK_CELLS,
    TREE_WIDTH_PX,
} from "../../../consts/treeIllustration";
import type { TreeHighlight } from "../../../utils/getTreeIllustration";

type Props = { highlight: TreeHighlight };

// The collision: the footprint as a faint outline, and filled only the cells
// the trunk stands on.
export const TreeCollisionHighlight = ({ highlight }: Props) => {
    if (highlight !== "collision") return null;

    return (
        <>
            <rect
                x="2"
                y={2 * TREE_TILE_PX}
                width={TREE_WIDTH_PX - 4}
                height={TREE_TILE_PX - 2}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.6"
            />
            <rect
                x={TREE_TRUNK_CELLS.x}
                y={TREE_TRUNK_CELLS.y}
                width={TREE_TRUNK_CELLS.cols * TREE_CELL_PX}
                height={TREE_TRUNK_CELLS.rows * TREE_CELL_PX}
                fill="rgba(239,68,68,0.55)"
                stroke="#EF4444"
                strokeWidth="2"
            />
        </>
    );
};
