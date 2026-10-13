import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FootprintEditor } from "@/features/assets/components/instances/variant/editor/FootprintEditor";
import { SeatsEditor } from "@/features/assets/components/instances/variant/editor/SeatsEditor";
import { VariantEditorTabs } from "@/features/assets/components/views/variant/VariantEditorTabs";
import {
    VARIANT_EDITORS,
    type VariantEditor,
} from "@/features/assets/consts/variantEditors";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    file: File;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    // A chair also has its seats to mark, so it gets the tabs.
    hasSeats: boolean;
    selectedSeat: number | null;
    onSelectSeat: (index: number | null) => void;
};

// The editors of a new rotation, one at a time. With more than one, the tabs
// share the toolbar row with the view controls.
export const EditorPanel = ({
    hasSeats,
    selectedSeat,
    onSelectSeat,
    ...editorProps
}: Props) => {
    const [editor, setEditor] = useState<VariantEditor>(
        VARIANT_EDITORS.FOOTPRINT
    );
    const tabs = (
        <VariantEditorTabs
            form={editorProps.form}
            value={editor}
            onChange={setEditor}
        />
    );

    // Without seats there is only the footprint, and no tabs to switch.
    if (!hasSeats) return <FootprintEditor {...editorProps} />;

    if (editor === VARIANT_EDITORS.SEATS) {
        return (
            <SeatsEditor
                {...editorProps}
                selected={selectedSeat}
                onSelect={onSelectSeat}
                leading={tabs}
            />
        );
    }
    return <FootprintEditor {...editorProps} leading={tabs} />;
};
