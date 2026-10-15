import { useEffect, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { DEFAULT_FOOTPRINT, NO_CROP } from "../consts/spriteGeometry";
import type { CreateAssetFormValues } from "../types/createForm";
import { footprintFitsCrop } from "../utils/footprintFitsCrop";
import {
    getFrameCrop,
    hasCrop,
    suggestFootprint,
} from "../utils/spriteGeometry";

// The crop and the footprint mean something different once the asset is
// animated: the footprint then lives in one frame of the strip. So turning the
// animation on or off clears both marks to be made again, and a new frame
// count only fixes the footprint when it no longer fits in a frame.
export const useResetMarksOnAnimation = (
    form: UseFormReturn<CreateAssetFormValues>
) => {
    const [isAnimated, frameCount] = useWatch({
        control: form.control,
        name: ["isAnimated", "frameCount"],
    });
    const previous = useRef({ isAnimated, frameCount });

    useEffect(() => {
        const before = previous.current;
        previous.current = { isAnimated, frameCount };

        if (before.isAnimated !== isAnimated) {
            form.setValue("cropX", NO_CROP.x);
            form.setValue("cropY", NO_CROP.y);
            form.setValue("cropW", NO_CROP.w);
            form.setValue("cropH", NO_CROP.h);
            form.setValue("footprintW", DEFAULT_FOOTPRINT.w);
            form.setValue("footprintH", DEFAULT_FOOTPRINT.h);
            form.setValue("footprintOffsetX", DEFAULT_FOOTPRINT.offsetX);
            return;
        }
        if (before.frameCount === frameCount || !isAnimated) return;

        const values = form.getValues();
        const crop = {
            x: values.cropX,
            y: values.cropY,
            w: values.cropW,
            h: values.cropH,
        };
        if (!hasCrop(crop)) return;
        const frame = getFrameCrop(crop, frameCount ?? 1);
        const footprint = {
            w: values.footprintW ?? DEFAULT_FOOTPRINT.w,
            h: values.footprintH ?? DEFAULT_FOOTPRINT.h,
            offsetX: values.footprintOffsetX ?? DEFAULT_FOOTPRINT.offsetX,
        };
        if (footprintFitsCrop(frame, footprint)) return;
        const suggested = suggestFootprint(frame);
        form.setValue("footprintW", suggested.w);
        form.setValue("footprintH", suggested.h);
        form.setValue("footprintOffsetX", suggested.offsetX);
    }, [isAnimated, frameCount, form]);
};
