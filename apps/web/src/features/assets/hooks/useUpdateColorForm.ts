import { useForm } from "react-hook-form";
import type { LibraryFamilyVariant } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { ASSET_FORM_MESSAGES } from "../consts/messages";
import { ASSET_VALIDATION_MESSAGES } from "../consts/validationMessages";
import { useUpdateColor } from "../mutations/updateColor";
import type { UpdateColorFormValues } from "../types/updateColorForm";
import { getRootErrorMessage } from "../utils/getRootErrorMessage";
import { validateColorPair } from "../utils/validateColorPair";

type Params = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Renames and recolors the color of a row. The API applies it to every
// rotation of that color, so the family stays consistent.
export const useUpdateColorForm = ({ asset, onDone }: Params) => {
    const updateColor = useUpdateColor();
    const initial: UpdateColorFormValues = {
        colorKey: asset.colorKey ?? "",
        colorHex: asset.colorHex ?? "",
    };
    const form = useForm<UpdateColorFormValues>({ defaultValues: initial });

    const onSubmit = async (values: UpdateColorFormValues) => {
        const key = values.colorKey.trim();
        const hex = values.colorHex.trim();
        const errors = validateColorPair({ colorKey: key, colorHex: hex });
        if (key === "") errors.colorKey = ASSET_VALIDATION_MESSAGES.REQUIRED;
        if (hex === "") errors.colorHex = ASSET_VALIDATION_MESSAGES.REQUIRED;
        if (errors.colorKey || errors.colorHex) {
            if (errors.colorKey) {
                form.setError("colorKey", { message: errors.colorKey });
            }
            if (errors.colorHex) {
                form.setError("colorHex", { message: errors.colorHex });
            }
            return;
        }
        if (key === initial.colorKey && hex === initial.colorHex) {
            return onDone();
        }

        try {
            await updateColor.mutateAsync({
                assetId: asset.id,
                color: { key, hex },
            });
            toast.add({
                title: ASSET_FORM_MESSAGES.COLOR_UPDATED,
                type: "success",
            });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getRootErrorMessage(
                    error,
                    ASSET_FORM_MESSAGES.COLOR_UPDATE_FAILED
                ),
            });
        }
    };

    return {
        form,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
