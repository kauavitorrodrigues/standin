import type { Control } from "react-hook-form";
import { GridIcon, UploadIcon } from "lucide-react";
import { MAX_TILESET_IMAGE_PX } from "@standin/contracts";
import { PngFormField } from "@/components/fields/PngFormField";
import { UploadStep } from "@/features/assets/components/views/upload/UploadStep";
import { MAX_UPLOAD_KB } from "@/features/assets/consts/uploadFile";
import type { CreateTilesetFormValues } from "../../../types/createForm";

type Props = {
    control: Control<CreateTilesetFormValues>;
    disabled: boolean;
    onFileChosen: (file: File) => void;
};

// The first step of a new tileset: only the sheet.
export const TilesetUploadStep = ({
    control,
    disabled,
    onFileChosen,
}: Props) => (
    <UploadStep
        title="Comece pela folha"
        description="Envie o PNG do tileset. Depois você marca, sobre a própria folha, o que cada tile é: chão, parede, teto, decoração ou vazio."
        steps={[
            { icon: UploadIcon, label: "Suba a folha em grade" },
            { icon: GridIcon, label: "Marque a categoria dos tiles" },
        ]}
        note={`PNG de até ${MAX_UPLOAD_KB} KB e ${MAX_TILESET_IMAGE_PX} px por lado, em células de 32 px. As colunas e a quantidade de tiles saem do tamanho do arquivo.`}
    >
        <PngFormField
            control={control}
            id="create-tileset-image"
            label="PNG do tileset"
            hint="Uma folha em grade de células de 32 px."
            placeholder="Arraste o PNG ou clique."
            dropzoneClassName="min-h-64"
            onFileChosen={onFileChosen}
            disabled={disabled}
        />
    </UploadStep>
);
