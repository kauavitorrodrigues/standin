import { FileJsonIcon } from "lucide-react";
import { FileUploadFormField } from "@/components/fields/FileUploadFormField";

type Props = {
    value: File[];
    onValueChange: (files: File[]) => void;
    disabled?: boolean;
    error?: string;
};

export const MapJsonFileField = (props: Props) => (
    <FileUploadFormField
        {...props}
        id="mapJsonFile"
        label="Tile map JSON"
        required
        placeholder="Arraste o arquivo .json ou clique para selecionar"
        accept="application/json"
        maxFiles={1}
        hideDropzoneWhenFilled
        renderPreview={() => <FileJsonIcon />}
    />
);
