import { useForm } from "react-hook-form";
import type { AvatarBase } from "@standin/contracts";
import {
    AVATAR_BASE_MESSAGES,
    AVATAR_PART_VALIDATION_MESSAGES as Validation,
} from "../../consts/messages";
import { useUpdateAvatarBase } from "../../mutations/admin/bases/update";
import type { EditBaseFormValues } from "../../types/parts";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";

type Params = { base: AvatarBase; onDone: () => void };

// Renames a base. The sprite and the preview have their own forms.
export const useEditBaseForm = ({ base, onDone }: Params) => {
    const updateBase = useUpdateAvatarBase();
    const form = useForm<EditBaseFormValues>({
        defaultValues: { name: base.name },
    });

    const onSubmit = async (values: EditBaseFormValues) => {
        const name = values.name.trim();
        if (name === "") {
            form.setError("name", { message: Validation.BASE_NAME_REQUIRED });
            return;
        }
        if (name === base.name) return onDone();

        try {
            await updateBase.mutateAsync({
                baseId: base.id,
                changes: { name },
            });
            onDone();
        } catch (error) {
            form.setError("root", {
                message: getAvatarPartErrorMessage(
                    error,
                    AVATAR_BASE_MESSAGES.UPDATE_FAILED
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
