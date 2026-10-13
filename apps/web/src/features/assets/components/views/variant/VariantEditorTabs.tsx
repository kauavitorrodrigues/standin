import { useWatch, type UseFormReturn } from "react-hook-form";
import { getToggleVariant } from "@/features/assets/utils/getToggleVariant";
import { ArmchairIcon, FootprintsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    VARIANT_EDITORS,
    type VariantEditor,
} from "@/features/assets/consts/variantEditors";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    value: VariantEditor;
    onChange: (editor: VariantEditor) => void;
};

// Which editor of the variation is open, on the left of the toolbar. Each tab
// says what it holds so far, so nothing needs a line of its own.
export const VariantEditorTabs = ({ form, value, onChange }: Props) => {
    const [footprintW, footprintH, seats] = useWatch({
        control: form.control,
        name: ["footprintW", "footprintH", "seats"],
    });

    return (
        <div className="flex gap-1 rounded-md border p-0.5">
            <Button
                type="button"
                size="sm"
                variant={getToggleVariant(value === VARIANT_EDITORS.FOOTPRINT)}
                onClick={() => onChange(VARIANT_EDITORS.FOOTPRINT)}
            >
                <FootprintsIcon />
                Pegada
                <span className="text-muted-foreground">
                    {footprintW} × {footprintH}
                </span>
            </Button>
            <Button
                type="button"
                size="sm"
                variant={getToggleVariant(value === VARIANT_EDITORS.SEATS)}
                onClick={() => onChange(VARIANT_EDITORS.SEATS)}
            >
                <ArmchairIcon />
                Assentos
                <span className="text-muted-foreground">{seats.length}</span>
            </Button>
        </div>
    );
};
