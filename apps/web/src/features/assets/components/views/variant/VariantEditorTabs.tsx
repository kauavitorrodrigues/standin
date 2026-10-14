import { useWatch, type UseFormReturn } from "react-hook-form";
import { EditorTabs } from "@/features/assets/components/views/editor/EditorTabs";
import type { VariantEditor } from "@/features/assets/consts/variantEditors";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    value: VariantEditor;
    onChange: (editor: VariantEditor) => void;
};

// The tabs of the editors of a variation, with what its form holds so far.
export const VariantEditorTabs = ({ form, value, onChange }: Props) => {
    const [footprintW, footprintH, seats] = useWatch({
        control: form.control,
        name: ["footprintW", "footprintH", "seats"],
    });

    return (
        <EditorTabs
            value={value}
            onChange={onChange}
            footprint={`${footprintW} × ${footprintH}`}
            seatCount={seats.length}
        />
    );
};
