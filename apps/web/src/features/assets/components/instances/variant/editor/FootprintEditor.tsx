import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { SpriteEditor } from "@/features/assets/components/instances/editor/SpriteEditor";
import { useVariantGeometry } from "@/features/assets/hooks/useVariantGeometry";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import type { Footprint } from "@/features/assets/types/spriteGeometry";

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
    const { crop, footprint } = useVariantGeometry(form, file, frameCount);

    const setFootprint = (next: Footprint) => {
        form.setValue("footprintW", next.w);
        form.setValue("footprintH", next.h);
        form.setValue("footprintOffsetX", next.offsetX);
        form.clearErrors(["footprintW", "footprintH"]);
    };

    return (
        <SpriteEditor
            file={file}
            crop={crop}
            frameCount={frameCount}
            footprint={footprint}
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
