import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { ASSET_FORM_MESSAGES } from "../consts/messages";
import { CREATE_ASSET_DEFAULT_VALUES } from "../consts/createForm";
import { useCreateAsset } from "../mutations/create";
import { readImageSize } from "../queries/useImageSize";
import type { CreateAssetFormValues } from "../types/createForm";
import { applyApiErrorWithFallback } from "../utils/applyApiErrorWithFallback";
import { buildAssetData } from "../utils/buildData";
import { cropImageFile } from "../utils/cropImageFile";
import { getFileBaseName, toDisplayName } from "../utils/deriveAssetNames";
import { getAssetCrop } from "../utils/getCrop";
import { getSpriteSize } from "../utils/getSpriteSize";
import { validateCreateAsset } from "../utils/validateCreate";
import { validateUploadFile } from "../utils/validateUploadFile";
import { useAssetTypePreset } from "./useAssetTypePreset";
import { useAutoColor } from "./useAutoColor";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

// Everything the form of a new asset does: fills the color from the image,
// suggests the name from the file, checks what saves a round trip, cuts the
// piece out of the image and sends it.
export const useCreateAssetForm = () => {
    const { paths } = useLibraryScope();
    const navigate = useNavigate();
    const createAsset = useCreateAsset();

    const form = useForm<CreateAssetFormValues>({
        defaultValues: CREATE_ASSET_DEFAULT_VALUES,
    });
    useAutoColor(form);
    useAssetTypePreset(form);

    const [file] = useWatch({ control: form.control, name: "image" });

    // The asset takes the name of the file until the user writes another one.
    const suggestName = (chosen: File) => {
        if (form.getValues("name").trim()) return;
        form.setValue("name", toDisplayName(getFileBaseName(chosen.name)));
    };

    const onSubmit = async (values: CreateAssetFormValues) => {
        const [original] = values.image;
        const imageSize = original ? await readImageSize(original) : undefined;
        const errors = validateCreateAsset(
            values,
            getSpriteSize(values, imageSize)
        );
        // What goes up is the piece inside the crop, not the whole image.
        const image =
            original && (await cropImageFile(original, getAssetCrop(values)));
        if (image) {
            const message = await validateUploadFile(image);
            if (message) errors.image = message;
        }
        const fields = Object.keys(errors) as (keyof CreateAssetFormValues)[];
        if (fields.length > 0 || !image) {
            for (const field of fields) {
                form.setError(field, { message: errors[field] });
            }
            return;
        }

        try {
            await createAsset.mutateAsync({
                image,
                data: buildAssetData(values),
            });
            toast.add({
                title: ASSET_FORM_MESSAGES.CREATED,
                type: "success",
            });
            navigate({ to: paths.assets });
        } catch (error) {
            applyApiErrorWithFallback(
                error,
                form.setError,
                ASSET_FORM_MESSAGES.CREATE_FAILED
            );
        }
    };

    return {
        form,
        file,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        suggestName,
        submit: form.handleSubmit(onSubmit),
        cancel: () => navigate({ to: paths.assets }),
    };
};
