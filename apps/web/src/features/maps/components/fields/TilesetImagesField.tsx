import { FileUploadFormField } from "@/components/fields/FileUploadFormField";

type Props = {
    value: File[];
    onValueChange: (files: File[]) => void;
    disabled?: boolean;
    error?: string;
};

export const TilesetImagesField = (props: Props) => (
    <FileUploadFormField
        {...props}
        id="tilesetImages"
        label="Imagens dos tilesets"
        required
        placeholder="Arraste uma ou mais imagens .png ou clique para selecionar"
        accept="image/png"
        multiple
    />
);
