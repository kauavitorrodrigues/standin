import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { NO_FOOTPRINT_MASK, NO_SOLID_MASK } from "../consts/footprintMask";
import type { AddVariantFormValues } from "../types/addVariantForm";
import type { Footprint } from "../types/spriteGeometry";

// Puts the footprint of a still variation on the whole image, so the cells of
// it can be read from the drawing. Does nothing while the footprint is already
// the whole image, or when it has to be marked by hand.
export const useFullFootprint = (
    form: UseFormReturn<AddVariantFormValues>,
    full: Footprint,
    enabled: boolean
) => {
    useEffect(() => {
        if (!enabled) return;
        form.setValue("footprintW", full.w);
        form.setValue("footprintH", full.h);
        form.setValue("footprintOffsetX", full.offsetX);
        form.setValue("footprintMask", NO_FOOTPRINT_MASK);
        form.setValue("footprintSolidMask", NO_SOLID_MASK);
        form.clearErrors(["footprintW", "footprintH"]);
    }, [form, enabled, full.w, full.h, full.offsetX]);
};
