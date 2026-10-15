import { useWatch, type UseFormReturn } from "react-hook-form";
import { AnimationCard } from "@/features/assets/components/fields/asset/AnimationCard";
import { SpriteEditor } from "@/features/assets/components/instances/editor/SpriteEditor";
import {
    DEFAULT_FOOTPRINT,
    NO_CROP,
} from "@/features/assets/consts/spriteGeometry";
import { useResetMarksOnAnimation } from "@/features/assets/hooks/useResetMarksOnAnimation";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";
import type { Crop, Footprint } from "@/features/assets/types/spriteGeometry";
import { getEditorFrameCount } from "@/features/assets/utils/getEditorFrameCount";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    file: File;
    disabled: boolean;
};

// The visual editor tied to the form: the crop and the footprint it marks
// are kept in the fields of the form, so the summary, the validation and the
// upload read them from there. For an animated asset the way the strip
// plays sits right under the image, since it describes the image.
export const ImageFields = ({ form, file, disabled }: Props) => {
    useResetMarksOnAnimation(form);
    const [cropX, cropY, cropW, cropH, footprintW, footprintH, offsetX] =
        useWatch({
            control: form.control,
            name: [
                "cropX",
                "cropY",
                "cropW",
                "cropH",
                "footprintW",
                "footprintH",
                "footprintOffsetX",
            ],
        });
    const crop: Crop = { x: cropX, y: cropY, w: cropW, h: cropH };
    const footprint: Footprint = {
        w: footprintW ?? DEFAULT_FOOTPRINT.w,
        h: footprintH ?? DEFAULT_FOOTPRINT.h,
        offsetX: offsetX ?? DEFAULT_FOOTPRINT.offsetX,
    };
    const [isAnimated, frameCount, solid] = useWatch({
        control: form.control,
        name: ["isAnimated", "frameCount", "solid"],
    });

    const setCrop = (next: Crop) => {
        form.setValue("cropX", next.x);
        form.setValue("cropY", next.y);
        form.setValue("cropW", next.w);
        form.setValue("cropH", next.h);
    };
    const setFootprint = (next: Footprint) => {
        form.setValue("footprintW", next.w);
        form.setValue("footprintH", next.h);
        form.setValue("footprintOffsetX", next.offsetX);
    };

    return (
        <div className="flex flex-col gap-4">
            <SpriteEditor
                file={file}
                crop={crop}
                frameCount={getEditorFrameCount(isAnimated, frameCount)}
                footprint={footprint}
                solid={solid}
                disabled={disabled}
                onMarkCrop={(next, suggested) => {
                    setCrop(next);
                    setFootprint(suggested);
                }}
                onMarkFootprint={setFootprint}
                onClear={() => {
                    setCrop(NO_CROP);
                    setFootprint(DEFAULT_FOOTPRINT);
                }}
                onRemoveImage={() => {
                    form.setValue("image", []);
                    setCrop(NO_CROP);
                    setFootprint(DEFAULT_FOOTPRINT);
                }}
            />
            <AnimationCard form={form} show={isAnimated} disabled={disabled} />
        </div>
    );
};
