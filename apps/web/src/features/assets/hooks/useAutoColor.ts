import { useEffect } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { CreateAssetFormValues } from "../types/createForm";
import { nameColor } from "../utils/nameColor";
import { readDominantColor } from "../utils/readDominantColor";

// Fills the color (key and tone) from the predominant color of the piece,
// again whenever the image or the crop changes. A field the user edited is
// left alone, so a chosen color is never overwritten.
export const useAutoColor = (form: UseFormReturn<CreateAssetFormValues>) => {
    const [images, cropX, cropY, cropW, cropH] = useWatch({
        control: form.control,
        name: ["image", "cropX", "cropY", "cropW", "cropH"],
    });
    const [file] = images;
    // Read while rendering so the form tracks these two fields.
    const { colorHex: hexEdited, colorKey: keyEdited } =
        form.formState.dirtyFields;

    useEffect(() => {
        if (!file) return;
        let cancelled = false;

        readDominantColor(file, {
            x: cropX,
            y: cropY,
            w: cropW,
            h: cropH,
        })
            .then((hex) => {
                if (cancelled || !hex) return;
                if (!hexEdited) form.setValue("colorHex", hex);
                if (!keyEdited) {
                    form.setValue("colorKey", nameColor(hex));
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [file, cropX, cropY, cropW, cropH, hexEdited, keyEdited, form]);
};
