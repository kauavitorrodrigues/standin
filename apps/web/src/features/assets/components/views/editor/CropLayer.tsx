import { CROP_COLOR } from "../../../consts/editorColors";
import { CROP_TINT_PERCENT } from "../../../consts/editorOverlayStyle";
import type { Zoom } from "../../../consts/editorZoom";
import type { Crop } from "../../../types/spriteGeometry";
import { LayerBox } from "./LayerBox";

type Props = {
    // Null when the layer is hidden.
    opacity: number | null;
    zoom: Zoom;
    crop: Crop;
    frame: Crop;
    frameCount: number;
};

// The crop, with the line between the frames of a strip.
export const CropLayer = ({
    opacity,
    zoom,
    crop,
    frame,
    frameCount,
}: Props) => {
    if (opacity === null) return null;

    const px = (value: number) => value * zoom;

    return (
        <LayerBox opacity={opacity}>
            <div
                className="pointer-events-none absolute border-2 border-dashed"
                style={{
                    left: px(crop.x),
                    top: px(crop.y),
                    width: px(crop.w),
                    height: px(crop.h),
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
        </LayerBox>
    );
};
