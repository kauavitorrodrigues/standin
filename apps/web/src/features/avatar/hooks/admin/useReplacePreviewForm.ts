import { useForm } from "react-hook-form";
import { AVATAR_PART_VALIDATION_MESSAGES as Validation } from "../../consts/messages";
import type { ReplacePreviewFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { validatePreviewFile } from "../../utils/admin/validatePreviewFile";

type Params = {
    // Sends the image to the route of the thing the preview belongs to.
    replace: (image: File) => Promise<unknown>;
    failedMessage: string;
    onDone: () => void;
};

// The form of one preview image, shared by parts, categories and bases. The
// image is any PNG within the size limit.
export const useReplacePreviewForm = ({
    replace,
    failedMessage,
    onDone,
}: Params) => {
    const form = useForm<ReplacePreviewFormValues>({
        defaultValues: { image: [] },
    });

    const onSubmit = async (values: ReplacePreviewFormValues) => {
        const [image] = values.image;
        if (!image) {
            form.setError("image", { message: Validation.PREVIEW_REQUIRED });
            return;
        }
        const message = await validatePreviewFile(image);
        if (message) {
            form.setError("image", { message });
            return;
        }

        try {
            await replace(image);
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(error, failedMessage),
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
