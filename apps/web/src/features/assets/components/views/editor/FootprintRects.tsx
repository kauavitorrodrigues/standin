import type { Zoom } from "../../../consts/editorZoom";
import type { FootprintMaskValue } from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getFootprintBoxStyle } from "../../../utils/getFootprintBoxStyle";
import { getFootprintRect } from "../../../utils/spriteGeometry";

type Props = {
    zoom: Zoom;
    frame: Crop;
    frameCount: number;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    paintable?: boolean;
};

// The footprint as one rectangle on each frame of the crop. Left out when it
// has a mask or its tiles can be painted, since then it is drawn tile by tile.
export const FootprintRects = ({
    zoom,
    frame,
    frameCount,
    footprint,
    mask,
    solid,
    paintable = false,
}: Props) => {
    if (mask || paintable) return null;

    return (
        <>
            {Array.from({ length: frameCount }, (_, index) => {
                const rect = getFootprintRect(
                    { ...frame, x: frame.x + index * frame.w },
                    footprint
                );
                return (
                    <div
                        key={index}
                        className="pointer-events-none absolute border-2"
                        style={{
                            left: rect.x * zoom,
                            top: rect.y * zoom,
                            width: rect.w * zoom,
                            height: rect.h * zoom,
                            ...getFootprintBoxStyle(solid, index),
                        }}
                    />
                );
            })}
        </>
    );
};
