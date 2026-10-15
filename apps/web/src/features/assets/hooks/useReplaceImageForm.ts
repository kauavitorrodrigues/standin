import { useForm, useWatch } from "react-hook-form";
import type { LibraryFamilyVariant } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { ASSET_FORM_MESSAGES } from "../consts/messages";
import { ASSET_VALIDATION_MESSAGES } from "../consts/validationMessages";
import { STATIC_FRAME_COUNT } from "../consts/frames";
import { useReplaceAssetImage } from "../mutations/replaceImage";
import type { ReplaceImageFormValues } from "../types/editForm";
import { getRootErrorMessage } from "../utils/getRootErrorMessage";
import { validateUploadFile } from "../utils/validateUploadFile";

type Params = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Swaps the PNG of a row that no map uses. The new one has to keep the frame
// size and, for an animated asset, the frame count.
export const useReplaceImageForm = ({ asset, onDone }: Params) => {
    const replaceImage = useReplaceAssetImage();
    const form = useForm<ReplaceImageFormValues>({
        defaultValues: { image: [] },
    });
    const [file] = useWatch({ control: form.control, name: "image" });

    const onSubmit = async (values: ReplaceImageFormValues) => {
        const [image] = values.image;
        if (!image) {
            form.setError("image", {
                message: ASSET_VALIDATION_MESSAGES.NEW_IMAGE_REQUIRED,
            });
            return;
        }
        const message = await validateUploadFile(image);
        if (message) {
            form.setError("image", { message });
            return;
        }

        try {
            await replaceImage.mutateAsync({ assetId: asset.id, image });
            toast.add({
                title: ASSET_FORM_MESSAGES.IMAGE_REPLACED,
                type: "success",
            });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getRootErrorMessage(
                    error,
                    ASSET_FORM_MESSAGES.IMAGE_REPLACE_FAILED
                ),
            });
        }
    };

    return {
        form,
        file,
        frameCount: asset.animation?.frameCount ?? STATIC_FRAME_COUNT,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
