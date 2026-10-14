import type { ReactNode } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { SeatsEditor as GenericSeatsEditor } from "@/features/assets/components/instances/editor/SeatsEditor";
import { useVariantGeometry } from "@/features/assets/hooks/useVariantGeometry";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    file: File;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    selected: number | null;
    onSelect: (index: number | null) => void;
    leading: ReactNode;
};

// The seats editor of a new rotation, tied to the fields of its form.
export const SeatsEditor = ({ form, file, frameCount, ...rest }: Props) => {
    const { crop, footprint, mask } = useVariantGeometry(
        form,
        file,
        frameCount
    );
    const seats = useWatch({ control: form.control, name: "seats" });

    return (
        <GenericSeatsEditor
            {...rest}
            file={file}
            crop={crop}
            frameCount={frameCount}
            footprint={footprint}
            mask={mask}
            seats={seats}
            onChange={(next) => {
                form.setValue("seats", next);
                form.clearErrors("seats");
            }}
            error={form.formState.errors.seats?.message}
            onRemoveImage={() => form.setValue("image", [])}
        />
    );
};
