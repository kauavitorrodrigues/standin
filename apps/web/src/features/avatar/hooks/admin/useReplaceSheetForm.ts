import { useForm } from "react-hook-form";
import type { AvatarPartRow } from "@standin/contracts";
import { AVATAR_PART_MESSAGES, AVATAR_PART_VALIDATION_MESSAGES as Validation } from "../../consts/messages";
import { useReplaceAvatarPartSheet } from "../../mutations/admin/replaceSheet";
import type { ReplaceSheetFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";
import { validateSheetFile } from "../../utils/admin/validateSheetFile";

type Params = { part: AvatarPartRow; onDone: () => void };

// Swaps the sprite of a part. The new PNG has to keep the grid of the avatar.
export const useReplaceSheetForm = ({ part, onDone }: Params) => {
    const replaceSheet = useReplaceAvatarPartSheet();
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
            await replaceSheet.mutateAsync({ partId: part.id, image });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_PART_MESSAGES.REPLACE_FRONT_FAILED
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
