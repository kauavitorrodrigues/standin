import { useWatch, type UseFormReturn } from "react-hook-form";
import {
    CropIcon,
    FileImageIcon,
    FootprintsIcon,
    KeyRoundIcon,
    PaletteIcon,
    RulerIcon,
    TagIcon,
} from "lucide-react";
import { TILE_SIZE } from "@standin/contracts";
import { ExtractedInfo } from "@/features/assets/components/views/upload/ExtractedInfo";
import type { ExtractedGroup } from "@/features/assets/types/extractedInfo";
import {
    CROP_COLOR,
    FOOTPRINT_COLOR,
    IMAGE_COLOR,
    NAME_COLOR,
} from "@/features/assets/consts/editorColors";
import { useImageSize } from "@/features/assets/queries/useImageSize";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";
import { describeCategory } from "@/features/assets/utils/describeCategory";
import { toKeyPreview } from "@/features/assets/utils/deriveAssetNames";
import { getSpriteSize } from "@/features/assets/utils/getSpriteSize";
import { hasCrop } from "@/features/assets/utils/spriteGeometry";

type Props = { form: UseFormReturn<CreateAssetFormValues> };

const BYTES_IN_KB = 1024;

const inTiles = (px: number) => px / TILE_SIZE;

// What the image and the fields already say, shown under the fields: the
// file, its size, the names that will be created, the category, the crop,
// the footprint and the color.
export const AssetInfo = ({ form }: Props) => {
    const values = useWatch({ control: form.control });
    const [file] = values.image ?? [];
    const { data: size } = useImageSize(file);

    if (!file) return null;

    const crop = {
        x: values.cropX ?? 0,
        y: values.cropY ?? 0,
        w: values.cropW ?? 0,
        h: values.cropH ?? 0,
    };
    const category = describeCategory({
        type: values.type!,
        category: values.category ?? "",
    });
    const name = (values.name ?? "").trim();
    const sprite = getSpriteSize({ cropW: crop.w, cropH: crop.h }, size);

    const groups: ExtractedGroup[] = [
        {
            title: "Imagem",
            rows: [
                {
                    label: "Arquivo",
                    value: `${file.name} (${Math.max(Math.round(file.size / BYTES_IN_KB), 1)} KB)`,
                    icon: FileImageIcon,
                    color: IMAGE_COLOR,
                },
                {
                    label: "Dimensões",
                    value: size
                        ? `${size.w} × ${size.h} px (${inTiles(size.w)} × ${inTiles(size.h)} tiles)`
                        : "Lendo...",
                    icon: RulerIcon,
                    color: IMAGE_COLOR,
                },
            ],
        },
        {
            title: "Nomes que serão criados",
            rows: [
                {
                    label: "Nome da peça",
                    value: name || "Sem nome",
                    icon: TagIcon,
                    color: NAME_COLOR,
                },
                {
                    label: "Chave da peça",
                    value: toKeyPreview(name) || "Sem nome",
                    icon: KeyRoundIcon,
                    color: NAME_COLOR,
                },
            ],
        },
        {
            title: "Peça",
            rows: [
                {
                    label: "Categoria",
                    value: category.value,
                    icon: category.icon,
                    color: category.color,
                },
                {
                    label: "Recorte",
                    value:
                        hasCrop(crop) && sprite
                            ? `${sprite.w} × ${sprite.h} px (${inTiles(sprite.w)} × ${inTiles(sprite.h)} tiles)`
                            : "Ainda não marcado, vale a imagem inteira",
                    icon: CropIcon,
                    color: CROP_COLOR,
                },
                {
                    label: "Pegada",
                    value: hasCrop(crop)
                        ? `${values.footprintW} × ${values.footprintH} tiles, deslocamento ${values.footprintOffsetX}`
                        : "Ainda não marcado",
                    icon: FootprintsIcon,
                    color: FOOTPRINT_COLOR,
                },
                {
                    label: "Cor",
                    value: values.colorKey
                        ? `${values.colorKey} (${values.colorHex})`
                        : "Sem cor",
                    icon: PaletteIcon,
                    color: values.colorHex || IMAGE_COLOR,
                },
            ],
        },
    ];

    return <ExtractedInfo groups={groups} />;
};
