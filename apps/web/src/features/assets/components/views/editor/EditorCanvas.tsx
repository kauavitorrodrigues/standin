import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TILE_SIZE } from "@standin/contracts";
import {
    CHECKER_DARK,
    CHECKER_LIGHT,
    GRID_LINE_COLOR,
} from "../../../consts/editorColors";
import type { EditorMode } from "../../../consts/editorModes";
import type { Zoom } from "../../../consts/editorZoom";
import type { ImageSize } from "../../../queries/useImageSize";
import type {
    FootprintMaskValue,
    FootprintTile,
    SolidCell,
    SolidMaskValue,
} from "../../../types/footprintMask";
import { GAME_RENDER_CONFIG } from "@/features/game/consts/game-config";
import { SCROLL_AREA_ATTRIBUTE } from "../../../hooks/useWheelZoom";
import { getCanvasCursor } from "../../../utils/getCanvasCursor";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { CropOverlay } from "./CropOverlay";
import { EditorImage } from "./EditorImage";

type Props = {
    url: string | undefined;
    size: ImageSize | undefined;
    zoom: Zoom;
    crop: Crop;
    frame: Crop;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    // The tiles of the footprint can be clicked to free or occupy them.
    paintable?: boolean;
    // The tile under the pointer, which a click would free or occupy.
    hoveredTile?: FootprintTile | null;
    // The layer being edited, drawn in full over the others, and whether the
    // collision can be drawn.
    mode?: EditorMode;
    collisionAvailable?: boolean;
    solidMask?: SolidMaskValue;
    hoveredCell?: SolidCell | null;
    // Drawn over the image, like the markers of another editor.
    children?: ReactNode;
    // Lets an editor stretch the canvas to the room it has.
    className?: string;
    pointerHandlers: Pick<
        HTMLAttributes<HTMLDivElement>,
        "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerLeave"
    >;
};

// The image with the 32 px grid over it and the two marked rectangles. It
// only draws, what a drag means is up to the pointer handlers.
export const EditorCanvas = ({
    url,
    size,
    zoom,
    crop,
    frame,
    footprint,
    mask,
    solid,
    paintable = false,
    hoveredTile = null,
    mode,
    collisionAvailable = false,
    solidMask = null,
    hoveredCell = null,
    children,
    className,
    pointerHandlers,
}: Props) => {
    const px = (value: number) => value * zoom;

    return (
        <div
            {...{ [SCROLL_AREA_ATTRIBUTE]: "" }}
            className={cn(
                "flex justify-center overflow-auto rounded-xl border p-4",
                className
            )}
            // The color the map editor draws on, so the image stands out from
            // the panels around it.
            style={{ backgroundColor: GAME_RENDER_CONFIG.BACKGROUND_COLOR }}
        >
            <div
                className={cn(
                    "relative my-auto shrink-0 touch-none select-none",
                    getCanvasCursor(hoveredTile, hoveredCell)
                )}
                style={{
                    width: px(size?.w ?? 0),
                    height: px(size?.h ?? 0),
                    backgroundColor: CHECKER_DARK,
                    backgroundImage: `conic-gradient(${CHECKER_LIGHT} 25%, transparent 0 50%, ${CHECKER_LIGHT} 0 75%, transparent 0)`,
                    backgroundSize: `${px(TILE_SIZE / 2)}px ${px(TILE_SIZE / 2)}px`,
                }}
                {...pointerHandlers}
            >
                <EditorImage url={url} size={size} zoom={zoom} />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        // A line at the end of each cell plus an inset border,
                        // so the edges of the image are closed on every side.
                        backgroundImage: `linear-gradient(to right, transparent calc(100% - 1px), ${GRID_LINE_COLOR} 0), linear-gradient(to bottom, transparent calc(100% - 1px), ${GRID_LINE_COLOR} 0)`,
                        backgroundSize: `${px(TILE_SIZE)}px ${px(TILE_SIZE)}px`,
                        boxShadow: `inset 0 0 0 1px ${GRID_LINE_COLOR}`,
                    }}
                />
                <CropOverlay
                    zoom={zoom}
                    crop={crop}
                    frame={frame}
                    footprint={footprint}
                    mask={mask}
                    solid={solid}
                    paintable={paintable}
                    hoveredTile={hoveredTile}
                    mode={mode}
                    collisionAvailable={collisionAvailable}
                    solidMask={solidMask}
                    hoveredCell={hoveredCell}
                />
                {children}
            </div>
        </div>
    );
};
