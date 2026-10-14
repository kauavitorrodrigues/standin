import { useWatch, type UseFormReturn } from "react-hook-form";
import { DEFAULT_FOOTPRINT } from "../consts/spriteGeometry";
import { useImageSize } from "../queries/useImageSize";
import type { AddVariantFormValues } from "../types/addVariantForm";
import type { Crop, Footprint } from "../types/spriteGeometry";
import { getFrameCrop } from "../utils/spriteGeometry";

// What both editors of a variation draw over its PNG. The PNG is already the
// whole piece, so the crop is the whole image, the frame is the first frame
// of the strip, and the footprint is the one in the fields of the form.
export const useVariantGeometry = (
    form: UseFormReturn<AddVariantFormValues>,
    file: File,
    frameCount: number
) => {
    const { data: size } = useImageSize(file);
    const [footprintW, footprintH, offsetX, mask, solidMask] = useWatch({
        control: form.control,
        name: [
            "footprintW",
            "footprintH",
            "footprintOffsetX",
            "footprintMask",
            "footprintSolidMask",
        ],
    });

    const crop: Crop = { x: 0, y: 0, w: size?.w ?? 0, h: size?.h ?? 0 };
    const footprint: Footprint = {
        w: footprintW ?? DEFAULT_FOOTPRINT.w,
        h: footprintH ?? DEFAULT_FOOTPRINT.h,
        offsetX: offsetX ?? DEFAULT_FOOTPRINT.offsetX,
    };

    return {
        size,
        crop,
        frame: getFrameCrop(crop, frameCount),
        footprint,
        mask,
        solidMask,
    };
};
