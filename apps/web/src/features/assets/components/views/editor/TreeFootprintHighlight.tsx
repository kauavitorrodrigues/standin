import { TREE_TILE_PX, TREE_WIDTH_PX } from "../../../consts/treeIllustration";
import type { TreeHighlight } from "../../../utils/getTreeIllustration";

type Props = { highlight: TreeHighlight };

// The rectangle of the footprint, only the bottom row where the trunk stands.
export const TreeFootprintHighlight = ({ highlight }: Props) => {
    if (highlight !== "footprint") return null;

    return (
        <rect
            x="2"
            y={2 * TREE_TILE_PX}
            width={TREE_WIDTH_PX - 4}
            height={TREE_TILE_PX - 2}
            fill="rgba(239,68,68,0.35)"
            stroke="#EF4444"
            strokeWidth="3"
        />
    );
};
