import type { Control } from "react-hook-form";
import { SlidersHorizontalIcon, UploadIcon } from "lucide-react";
import { MAX_TILESET_IMAGE_PX } from "@standin/contracts";
import { PngFormField } from "@/components/fields/PngFormField";
import { MAX_UPLOAD_KB } from "../../../consts/uploadFile";
import type { CreateAssetFormValues } from "../../../types/createForm";
import { UploadStep } from "./UploadStep";

type Props = {
    control: Control<CreateAssetFormValues>;
    disabled: boolean;
    onFileChosen: (file: File) => void;
};

// The first step of a new asset: only the image.
export const AssetUploadStep = ({ control, disabled, onFileChosen }: Props) => (
    <UploadStep
        title="Comece pela imagem"
        description="Envie o PNG. Depois você marca o recorte da peça e a pegada sobre a imagem e descreve como ela se comporta no mapa."
        steps={[
            { icon: UploadIcon, label: "Suba o PNG da peça" },
            {
                icon: SlidersHorizontalIcon,
                label: "Marque o recorte e a pegada",
            },
        ]}
        note={`PNG de até ${MAX_UPLOAD_KB} KB e ${MAX_TILESET_IMAGE_PX} px por lado, com o recorte e a pegada em múltiplos de 32. Uma peça animada é uma faixa horizontal de frames do mesmo tamanho.`}
    >
        <PngFormField
            control={control}
            id="create-asset-image"
            label="PNG do asset"
            hint="A peça inteira em um PNG. O tamanho do frame sai do próprio arquivo. Para uma peça animada, envie uma faixa horizontal com os frames lado a lado."
            placeholder="Arraste o PNG ou clique."
            dropzoneClassName="min-h-64"
            onFileChosen={onFileChosen}
            disabled={disabled}
        />
    </UploadStep>
);
