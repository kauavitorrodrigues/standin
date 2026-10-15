import {
    CHECKER_DARK,
    CHECKER_LIGHT,
    GRID_LINE_COLOR,
} from "../../../consts/editorColors";
import {
    TREE_GRID_LINES,
    TREE_HEIGHT_PX,
    TREE_PAD_PX,
    TREE_TILE_PX,
    TREE_WIDTH_PX,
} from "../../../consts/treeIllustration";
import {
    getTreeAriaLabel,
    getTreeOpacity,
    type TreeHighlight,
} from "../../../utils/getTreeIllustration";
import { TreeCollisionHighlight } from "./TreeCollisionHighlight";
import { TreeCropHighlight } from "./TreeCropHighlight";
import { TreeFootprintHighlight } from "./TreeFootprintHighlight";

type Props = {
    // Which rectangle is drawn over the tree.
    highlight: TreeHighlight;
};

// A tree on a 2 x 3 tile grid, the example of the help: the crop is all of
// it, the footprint is only the bottom row where the trunk stands and the
// collision is only the cells of the trunk.
export const TreeIllustration = ({ highlight }: Props) => (
    <svg
        viewBox={`${-TREE_PAD_PX} ${-TREE_PAD_PX} ${TREE_WIDTH_PX + 2 * TREE_PAD_PX} ${TREE_HEIGHT_PX + 2 * TREE_PAD_PX}`}
        className="h-40"
        role="img"
        aria-label={getTreeAriaLabel(highlight)}
    >
        <defs>
            <pattern
                id="tree-checker"
                width={TREE_TILE_PX / 2}
                height={TREE_TILE_PX / 2}
                patternUnits="userSpaceOnUse"
            >
                <rect
                    width={TREE_TILE_PX / 2}
                    height={TREE_TILE_PX / 2}
                    fill={CHECKER_DARK}
                />
                <rect
                    width={TREE_TILE_PX / 4}
                    height={TREE_TILE_PX / 4}
                    fill={CHECKER_LIGHT}
                />
                <rect
                    x={TREE_TILE_PX / 4}
                    y={TREE_TILE_PX / 4}
                    width={TREE_TILE_PX / 4}
                    height={TREE_TILE_PX / 4}
                    fill={CHECKER_LIGHT}
                />
            </pattern>
        </defs>
        <rect
            width={TREE_WIDTH_PX}
            height={TREE_HEIGHT_PX}
            fill="url(#tree-checker)"
        />
        {TREE_GRID_LINES.map((line) => (
            <g key={line} stroke={GRID_LINE_COLOR} strokeWidth="1">
                <line x1={line} y1="0" x2={line} y2={TREE_HEIGHT_PX} />
                <line x1="0" y1={line} x2={TREE_WIDTH_PX} y2={line} />
            </g>
        ))}
        <rect
            width={TREE_WIDTH_PX}
            height={TREE_HEIGHT_PX}
            fill="none"
            stroke={GRID_LINE_COLOR}
            strokeWidth="1"
        />
        <g opacity={getTreeOpacity(highlight)}>
            <rect x="56" y="108" width="16" height="52" fill="#7c5a3a" />
            <ellipse cx="64" cy="68" rx="46" ry="52" fill="#3f9b4a" />
            <ellipse cx="50" cy="52" rx="20" ry="22" fill="#5fbf63" />
        </g>
        <TreeCropHighlight highlight={highlight} />
        <TreeFootprintHighlight highlight={highlight} />
        <TreeCollisionHighlight highlight={highlight} />
    </svg>
);
