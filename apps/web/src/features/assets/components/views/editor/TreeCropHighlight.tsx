import {
    TREE_HEIGHT_PX,
    TREE_WIDTH_PX,
} from "../../../consts/treeIllustration";
import type { TreeHighlight } from "../../../utils/getTreeIllustration";

type Props = { highlight: TreeHighlight };

// The rectangle of the crop, which is all of the tree.
export const TreeCropHighlight = ({ highlight }: Props) => {
    if (highlight !== "crop") return null;

    return (
        <rect
            x="2"
            y="2"
            width={TREE_WIDTH_PX - 4}
            height={TREE_HEIGHT_PX - 4}
            fill="var(--primary)"
            fillOpacity="0.1"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeDasharray="8 5"
        />
    );
};
