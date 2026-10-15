import { useEffect, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { NO_FOOTPRINT_MASK, NO_SOLID_MASK } from "../consts/footprintMask";
import { NO_CROP, NO_FOOTPRINT } from "../consts/spriteGeometry";
import type { CreateAssetFormValues } from "../types/createForm";
import { footprintFitsCrop } from "../utils/footprintFitsCrop";
import { keepSeatsInFrame } from "../utils/seatList";
import { getFrameCrop, hasCrop, hasFootprint } from "../utils/spriteGeometry";

// The crop and the footprint mean something different once the asset is
// animated: the footprint then lives in one frame of the strip. So turning the
// animation on or off clears both marks to be made again, and a new frame
// count only clears the footprint when it no longer fits in a frame.
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
            form.setValue("footprintW", NO_FOOTPRINT.w);
            form.setValue("footprintH", NO_FOOTPRINT.h);
            form.setValue("footprintOffsetX", NO_FOOTPRINT.offsetX);
            form.setValue("footprintMask", NO_FOOTPRINT_MASK);
            form.setValue("footprintSolidMask", NO_SOLID_MASK);
            form.setValue("seats", []);
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
        form.setValue("seats", keepSeatsInFrame(values.seats, frame));
        const footprint = {
            w: values.footprintW ?? NO_FOOTPRINT.w,
            h: values.footprintH ?? NO_FOOTPRINT.h,
            offsetX: values.footprintOffsetX ?? NO_FOOTPRINT.offsetX,
        };
        if (!hasFootprint(footprint) || footprintFitsCrop(frame, footprint)) {
            return;
        }
        form.setValue("footprintW", NO_FOOTPRINT.w);
        form.setValue("footprintH", NO_FOOTPRINT.h);
        form.setValue("footprintOffsetX", NO_FOOTPRINT.offsetX);
        form.setValue("footprintMask", NO_FOOTPRINT_MASK);
        form.setValue("footprintSolidMask", NO_SOLID_MASK);
    }, [isAnimated, frameCount, form]);
};
