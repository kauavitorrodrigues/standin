import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { SpriteEditor } from "@/features/assets/components/instances/editor/SpriteEditor";
import { useFullFootprint } from "@/features/assets/hooks/useFullFootprint";
import { useVariantGeometry } from "@/features/assets/hooks/useVariantGeometry";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import {
    NO_FOOTPRINT_MASK,
    NO_SOLID_MASK,
} from "@/features/assets/consts/footprintMask";
import type { FootprintMasks } from "@/features/assets/types/footprintMask";
import type { Footprint } from "@/features/assets/types/spriteGeometry";
import {
    getFootprintOfFrame,
    hasCrop,
} from "@/features/assets/utils/spriteGeometry";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    file: File;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    leading?: ReactNode;
};

// The visual editor of the creation page, for the footprint of a new
// rotation. Only the footprint is marked, and it is kept in the fields of the
// form, like the numbers it replaces.
export const FootprintEditor = ({
    form,
    file,
    frameCount,
    solid,
    disabled,
    leading,
}: Props) => {
    const { crop, footprint, mask, solidMask } = useVariantGeometry(
        form,
        file,
        frameCount
    );

    const setFootprint = (next: Footprint) => {
        form.setValue("footprintW", next.w);
        form.setValue("footprintH", next.h);
        form.setValue("footprintOffsetX", next.offsetX);
        form.setValue("footprintMask", NO_FOOTPRINT_MASK);
        form.setValue("footprintSolidMask", NO_SOLID_MASK);
        form.clearErrors(["footprintW", "footprintH"]);
    };
    const setMasks = (next: FootprintMasks) => {
        form.setValue("footprintMask", next.mask);
        form.setValue("footprintSolidMask", next.solidMask);
    };
    // A still piece starts with the whole image as its footprint, and the
    // cells of it are read from the drawing. The footprint of an animated one
    // is marked on its own.
    const full = getFootprintOfFrame(crop);
    const isStill = frameCount <= 1;
    const needsFull =
        isStill &&
        hasCrop(crop) &&
        (footprint.w !== full.w ||
            footprint.h !== full.h ||
            footprint.offsetX !== full.offsetX);
    useFullFootprint(form, full, needsFull);

    return (
        <SpriteEditor
            file={file}
            crop={crop}
            frameCount={frameCount}
            footprint={footprint}
            mask={mask}
            solidMask={solidMask}
            onChangeSolid={setMasks}
            solid={solid}
            footprintOnly
            fill
            leading={leading}
            disabled={disabled}
            onMarkFootprint={setFootprint}
            onRemoveImage={() => form.setValue("image", [])}
        />
    );
};
