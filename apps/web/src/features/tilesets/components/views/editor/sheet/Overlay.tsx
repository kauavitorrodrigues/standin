import { memo } from "react";
import { LockIcon, StarIcon } from "lucide-react";
import type { TileCutout } from "../../../../types/sheet";
import { getTileCutoutStyle } from "../../../../utils/editor/getCutoutStyle";
import {
    getTileBackground,
    getTileOutline,
} from "../../../../utils/editor/getStyle";
import { LockedTileDot } from "./LockedDot";
import { TileMark } from "./Mark";
import { TileMarks } from "./Marks";

type Props = {
    left: number;
    top: number;
    side: number;
    markSize: number;
    color: string;
    hasCategory: boolean;
    solid: boolean;
    blankDefault: boolean;
    dimmed: boolean;
    selected: boolean;
    isTop: boolean;
    previewed: boolean;
    hovered: boolean;
    locked: boolean;
    cutout?: TileCutout;
};

// One tile marked over the sheet. The pointer changes the hovered one all
// the time, so only the tiles whose props changed are drawn again.
export const TileOverlay = memo(function TileOverlay({
    left,
    top,
    side,
    markSize,
    color,
    hasCategory,
    solid,
    blankDefault,
    dimmed,
    selected,
    isTop,
    previewed,
    hovered,
    locked,
    cutout,
}: Props) {
    const showMarks = hasCategory && !dimmed;

    return (
        <div
            className="pointer-events-none absolute"
            style={{
                left,
                top,
                width: side,
                height: side,
                backgroundColor: getTileBackground(color, hasCategory, dimmed),
                ...getTileCutoutStyle(cutout),
                outline: getTileOutline({
                    selected,
                    top: isTop,
                    previewed,
                    hovered,
                }),
                outlineOffset: -2,
                zIndex: selected || isTop ? 2 : 1,
            }}
        >
            <TileMarks show={showMarks} color={color}>
                <TileMark show={solid} icon={LockIcon} size={markSize} />
                <TileMark
                    show={blankDefault}
                    icon={StarIcon}
                    size={markSize}
                    filled
                />
            </TileMarks>
            <LockedTileDot show={showMarks && locked} />
        </div>
    );
});
