import { useEffect } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { AddVariantFormValues } from "../types/addVariantForm";
import { nameColor } from "../utils/nameColor";
import { readDominantColor } from "../utils/readDominantColor";
import { NO_CROP } from "../consts/spriteGeometry";

// Fills the color (key and tone) of a variation from the predominant color
// of its PNG, again whenever the image changes. A field the user edited is
// left alone.
export const useVariantAutoColor = (
    form: UseFormReturn<AddVariantFormValues>,
    enabled: boolean
) => {
    const [file] = useWatch({ control: form.control, name: "image" });
    // Read while rendering so the form tracks these two fields.
    const { colorHex: hexEdited, colorKey: keyEdited } =
        form.formState.dirtyFields;

    useEffect(() => {
        if (!enabled || !file) return;
        let cancelled = false;

        readDominantColor(file, NO_CROP)
            .then((hex) => {
                if (cancelled || !hex) return;
                if (!hexEdited) form.setValue("colorHex", hex);
                if (!keyEdited) form.setValue("colorKey", nameColor(hex));
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [enabled, file, hexEdited, keyEdited, form]);
};
