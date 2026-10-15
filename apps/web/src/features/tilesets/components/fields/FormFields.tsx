import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Grid3x3Icon, RulerIcon } from "lucide-react";
import { TextFormField } from "@/components/fields/TextFormField";
import { ExtractedInfo } from "@/features/assets/components/views/upload/ExtractedInfo";
import { IMAGE_COLOR } from "@/features/assets/consts/editorColors";
import type { ImageSize } from "@/features/assets/queries/useImageSize";
import type { ExtractedGroup } from "@/features/assets/types/extractedInfo";
import type { CreateTilesetFormValues } from "../../types/createForm";
import type { GridSuggestion, TileSheetGrid } from "../../types/sheet";
import { getGridSuggestions } from "../../utils/grid/getGridSuggestions";
import { TilesetGridPicker } from "../views/detail/grid/Picker";
import { AdvancedTilesetFields } from "./AdvancedFields";
import { GridMismatchNotice } from "./GridMismatchNotice";
import { TilesetGridValue } from "./GridValue";
import { TilesetSizeValue } from "./SizeValue";

type Props = {
    form: UseFormReturn<CreateTilesetFormValues>;
    size: ImageSize | undefined;
    grid: TileSheetGrid | null;
    disabled: boolean;
};

// The fields of a new tileset: its name, the margin and the spacing of the
// sheet, and what the image says, with the grid read from it as the margin
// and the spacing are typed.
export const TilesetFormFields = ({ form, size, grid, disabled }: Props) => {
    const [margin, spacing] = useWatch({
        control: form.control,
        name: ["margin", "spacing"],
    });
    const pick = (suggestion: GridSuggestion) => {
        form.setValue("margin", suggestion.margin, { shouldDirty: true });
        form.setValue("spacing", suggestion.spacing, { shouldDirty: true });
        form.clearErrors(["margin", "spacing"]);
    };

    // The picker is open, and the fields to type are open in it. There are no
    // such fields here, since the form has its own, so it only opens.
    const [pickerOpen, setPickerOpen] = useState(false);
    const [typing, setTyping] = useState(false);

    const groups: ExtractedGroup[] = [
        {
            title: "Imagem",
            rows: [
                {
                    label: "Dimensões",
                    value: <TilesetSizeValue size={size} />,
                    icon: RulerIcon,
                    color: IMAGE_COLOR,
                },
                {
                    label: "Grade",
                    value: (
                        <TilesetGridPicker
                            suggestions={size ? getGridSuggestions(size) : []}
                            margin={margin}
                            spacing={spacing}
                            disabled={disabled}
                            open={pickerOpen}
                            onOpenChange={setPickerOpen}
                            typing={typing}
                            onTypingChange={setTyping}
                            onPick={pick}
                        >
                            <TilesetGridValue size={size} grid={grid} />
                        </TilesetGridPicker>
                    ),
                    icon: Grid3x3Icon,
                    color: IMAGE_COLOR,
                },
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                placeholder="Pisos"
                disabled={disabled}
            />
            <AdvancedTilesetFields
                control={form.control}
                hasGridError={form.formState.errors.margin !== undefined}
                disabled={disabled}
            />
            <ExtractedInfo groups={groups} />
            <GridMismatchNotice size={size} grid={grid} />
        </div>
    );
};
