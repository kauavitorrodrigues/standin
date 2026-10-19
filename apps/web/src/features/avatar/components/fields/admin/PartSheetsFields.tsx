import type { Control, FieldValues, Path } from "react-hook-form";
import type { CreateSheetFormValues } from "../../../types/partCreate";
import { ColorPairFields } from "./ColorPairFields";
import { PreviewFileField } from "./PreviewFileField";
import { SheetFormField } from "./SheetFormField";

type Props<T extends FieldValues & CreateSheetFormValues> = {
    control: Control<T>;
    // Keeps the ids of the file inputs apart when two forms share a page.
    idPrefix: string;
    // A new color has to have its name and hex. A new part may have none.
    requireColor: boolean;
    disabled?: boolean;
    // Drops the dropzones once the file is chosen, leaving only the file.
    hideDropzoneWhenFilled?: boolean;
};

// The sprite, the preview and the color of a new part or a new color, both
// images required. The color is filled from the sprite as soon as it is
// chosen.
export function PartSheetsFields<
    T extends FieldValues & CreateSheetFormValues,
>({
    control,
    idPrefix,
    requireColor,
    disabled,
    hideDropzoneWhenFilled,
}: Props<T>) {
    return (
        <>
            <SheetFormField
                control={control}
                name={"image" as Path<T>}
                id={`${idPrefix}-image`}
                label="Sprite"
                hint="Precisa ter o tamanho exato da grade do avatar, com fundo transparente. Já cobre as quatro direções."
                required
                disabled={disabled}
                hideDropzoneWhenFilled={hideDropzoneWhenFilled}
                compact
            />
            <PreviewFileField
                control={control}
                name={"preview" as Path<T>}
                id={`${idPrefix}-preview`}
                label="Imagem de pré-visualização"
                required
                disabled={disabled}
                hideDropzoneWhenFilled={hideDropzoneWhenFilled}
            />
            <ColorPairFields
                control={control}
                required={requireColor}
                disabled={disabled}
            />
        </>
    );
}
