import { useWatch, type UseFormReturn } from "react-hook-form";
import {
    FileImageIcon,
    FootprintsIcon,
    FrameIcon,
    PaletteIcon,
    RotateCwIcon,
    RulerIcon,
    TargetIcon,
} from "lucide-react";
import { ASSET_ACTIONS, type AssetDefinition } from "@standin/contracts";
import { ExtractedInfo } from "@/features/assets/components/views/upload/ExtractedInfo";
import { RemoveImageButton } from "@/features/assets/components/views/upload/RemoveImageButton";
import {
    ColorValue,
    FootprintValue,
    FrameValue,
    ImageSizeValue,
    RotationValue,
    TeleportTargetValue,
} from "@/features/assets/components/views/variant/VariantInfoValues";
import {
    FOOTPRINT_COLOR,
    IMAGE_COLOR,
    NAME_COLOR,
} from "@/features/assets/consts/editorColors";
import { useImageSize } from "@/features/assets/queries/useImageSize";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import type { ExtractedGroup } from "@/features/assets/types/extractedInfo";
import { getFileSizeKb } from "@/features/assets/utils/getFileSizeKb";
import { getFrameSize } from "@/features/assets/utils/getFrameSize";
import { getSwatchColor } from "@/features/assets/utils/getSwatchColor";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    action: AssetDefinition["action"];
    // 1 for a static asset, the frames of the strip otherwise.
    frameCount: number;
    disabled: boolean;
    familyHasColor: boolean;
    isNewRotation: boolean;
};

// What the variation will be, worked out from the image and the editors. The
// name, the key and the category are the ones of the base, so they are not
// listed.
export const VariantInfo = ({
    form,
    action,
    frameCount,
    disabled,
    familyHasColor,
    isNewRotation,
}: Props) => {
    const values = useWatch({ control: form.control });
    const [file] = values.image ?? [];
    const { data: size } = useImageSize(file);
    if (!file) return null;

    const groups: ExtractedGroup[] = [
        {
            title: "Variação",
            rows: [
                {
                    label: "Arquivo",
                    value: `${file.name} (${getFileSizeKb(file)} KB)`,
                    icon: FileImageIcon,
                    color: IMAGE_COLOR,
                    action: (
                        <RemoveImageButton
                            disabled={disabled}
                            onRemove={() => form.setValue("image", [])}
                        />
                    ),
                },
                {
                    label: "Dimensões",
                    value: <ImageSizeValue size={size} />,
                    icon: RulerIcon,
                    color: IMAGE_COLOR,
                },
                {
                    label: "Frame",
                    value: (
                        <FrameValue
                            size={size}
                            frame={size && getFrameSize(size, frameCount)}
                            frameCount={frameCount}
                        />
                    ),
                    icon: FrameIcon,
                    color: IMAGE_COLOR,
                },
                {
                    label: "Rotação",
                    value: <RotationValue rotation={values.rotation ?? ""} />,
                    icon: RotateCwIcon,
                    color: NAME_COLOR,
                },
                {
                    label: "Cor",
                    value: (
                        <ColorValue
                            colorKey={values.colorKey ?? ""}
                            colorHex={values.colorHex ?? ""}
                        />
                    ),
                    icon: PaletteIcon,
                    color: getSwatchColor(values.colorHex),
                    show: familyHasColor,
                },
                {
                    label: "Pegada",
                    value: (
                        <FootprintValue
                            isNewRotation={isNewRotation}
                            width={values.footprintW}
                            height={values.footprintH}
                            offsetX={values.footprintOffsetX}
                        />
                    ),
                    icon: FootprintsIcon,
                    color: FOOTPRINT_COLOR,
                },
                {
                    label: "Destino",
                    value: (
                        <TeleportTargetValue
                            targetX={values.targetX}
                            targetY={values.targetY}
                        />
                    ),
                    icon: TargetIcon,
                    color: NAME_COLOR,
                    // The seats have a list of their own beside the editor.
                    show: isNewRotation && action === ASSET_ACTIONS.TELEPORT,
                },
            ],
        },
    ];

    return <ExtractedInfo groups={groups} compact />;
};
