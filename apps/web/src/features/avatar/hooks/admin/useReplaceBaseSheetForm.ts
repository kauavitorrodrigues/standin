import { useForm } from "react-hook-form";
import type { AvatarBase } from "@standin/contracts";
import {
    AVATAR_BASE_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { useReplaceAvatarBaseImage } from "../../mutations/admin/bases/replaceImage";
import type { ReplaceSheetFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { validateSheetFile } from "../../utils/admin/validateSheetFile";

type Params = { base: AvatarBase; onDone: () => void };

// Swaps the sprite sheet of a base. The new PNG has to keep the grid of the
// avatar, and the avatars on this base are rebuilt by the server.
export const useReplaceBaseSheetForm = ({ base, onDone }: Params) => {
    const replaceImage = useReplaceAvatarBaseImage();
    const form = useForm<ReplaceSheetFormValues>({
        defaultValues: { image: [] },
    });

    const onSubmit = async (values: ReplaceSheetFormValues) => {
        const [image] = values.image;
        if (!image) {
            form.setError("image", { message: Validation.SHEET_REQUIRED });
            return;
        }
        const message = await validateSheetFile(image);
        if (message) {
            form.setError("image", { message });
            return;
        }

        try {
            await replaceImage.mutateAsync({ baseId: base.id, image });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_BASE_MESSAGES.REPLACE_IMAGE_FAILED
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
