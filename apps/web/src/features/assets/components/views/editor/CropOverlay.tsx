import { CROP_COLOR } from "../../../consts/editorColors";
import { CROP_TINT_PERCENT } from "../../../consts/editorOverlayStyle";
import type { Zoom } from "../../../consts/editorZoom";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getFootprintBoxStyle } from "../../../utils/getFootprintBoxStyle";
import { getFootprintRect, hasCrop } from "../../../utils/spriteGeometry";

type Props = {
    zoom: Zoom;
    crop: Crop;
    frame: Crop;
    footprint: Footprint;
    solid: boolean;
};

// The two rectangles the editor marks: the crop (with the line between the
// frames of a strip) and the footprint on each frame. Nothing until the crop
// is marked.
export const CropOverlay = ({ zoom, crop, frame, footprint, solid }: Props) => {
    if (!hasCrop(crop)) return null;

    const px = (value: number) => value * zoom;
    const rectStyle = (rect: Crop) => ({
        left: px(rect.x),
        top: px(rect.y),
        width: px(rect.w),
        height: px(rect.h),
    });
    // How many frames the crop holds, 1 when it is not a strip.
    const frameCount = Math.max(Math.round(crop.w / frame.w), 1);

    return (
        <>
            <div
                className="pointer-events-none absolute border-2 border-dashed"
                style={{
                    ...rectStyle(crop),
                    borderColor: CROP_COLOR,
                    backgroundColor: `color-mix(in srgb, ${CROP_COLOR} ${CROP_TINT_PERCENT}%, transparent)`,
                }}
            />
            {Array.from({ length: frameCount - 1 }, (_, index) => (
                <div
                    key={index}
                    className="pointer-events-none absolute border-l border-dashed"
                    style={{
                        left: px(crop.x + (index + 1) * frame.w),
                        top: px(crop.y),
                        height: px(crop.h),
                        borderColor: CROP_COLOR,
                    }}
                />
            ))}
            {Array.from({ length: frameCount }, (_, index) => (
                <div
                    key={index}
                    className="pointer-events-none absolute border-2"
                    style={{
                        ...rectStyle(
                            getFootprintRect(
                                { ...frame, x: frame.x + index * frame.w },
                                footprint
                            )
                        ),
                        ...getFootprintBoxStyle(solid, index),
                    }}
                />
            ))}
        </>
    );
};
