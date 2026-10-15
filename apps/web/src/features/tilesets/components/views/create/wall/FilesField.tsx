import { Controller, type Control } from "react-hook-form";
import { FileUploadFormField } from "@/components/fields/FileUploadFormField";
import { WALL_STYLE_MAX_FILES } from "../../../../consts/wallStyle";
import type { WallStyleFormValues } from "../../../../types/wallStyleForm";

type Props = {
    control: Control<WallStyleFormValues>;
    disabled: boolean;
    // Hands the files over to the list, which places or asks for each one.
    onFiles: (files: File[]) => void;
};

// The pieces of the style, all at once. The ones whose name ends in n, ne, e,
// se, s, sw, w or nw go to their place, and any other takes a free one to be
// moved in the list. One strip of 256 x 64 px with all eight
// is also taken. It is always there, so the form keeps the same height.
export const WallStyleFilesField = ({ control, disabled, onFiles }: Props) => {
    return (
        <Controller
            control={control}
            name="files"
            render={({ field, fieldState }) => (
                <FileUploadFormField
                    id="wall-style-files"
                    label="Peças"
                    hint="Nome terminando em n, ne, e, se, s, sw, w ou nw: a peça é reconhecida sozinha. Os outros arquivos ocupam as vagas livres e você ajusta a peça na lista. Vale também uma tira de 256 x 64 px."
                    required
                    placeholder="Solte as peças aqui ou clique."
                    accept="image/png"
                    multiple
                    maxFiles={WALL_STYLE_MAX_FILES}
                    dropzoneClassName="min-h-24"
                    value={field.value}
                    onValueChange={onFiles}
                    disabled={disabled}
                    error={fieldState.error?.message}
                />
            )}
        />
    );
};
