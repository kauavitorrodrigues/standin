import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TILE_SIZE } from "@standin/contracts";
import {
    CHECKER_DARK,
    CHECKER_LIGHT,
    GRID_LINE_COLOR,
} from "../../../consts/editorColors";
import type { Zoom } from "../../../consts/editorZoom";
import type { ImageSize } from "../../../queries/useImageSize";
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
    solid: boolean;
    // Drawn over the image, like the markers of another editor.
    children?: ReactNode;
    // Lets an editor stretch the canvas to the room it has.
    className?: string;
    pointerHandlers: Pick<
        HTMLAttributes<HTMLDivElement>,
        "onPointerDown" | "onPointerMove" | "onPointerUp"
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
    solid,
    children,
    className,
    pointerHandlers,
}: Props) => {
    const px = (value: number) => value * zoom;

    return (
        <div
            className={cn(
                "bg-muted/30 flex max-h-[32rem] justify-center overflow-auto rounded-xl border p-4",
                className
            )}
        >
            <div
                className="relative my-auto shrink-0 cursor-crosshair touch-none select-none"
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
                    solid={solid}
                />
                {children}
            </div>
        </div>
    );
};
