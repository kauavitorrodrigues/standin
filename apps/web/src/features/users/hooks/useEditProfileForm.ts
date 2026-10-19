import { useForm } from "react-hook-form";
import { UserUpdateSchema } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
    EDIT_PROFILE_MESSAGES,
    EDIT_PROFILE_VALIDATION_MESSAGES as Validation,
} from "../consts/editProfile";
import { useUpdateProfile } from "../mutations/updateProfile";
import type { EditProfileFormValues } from "../types/editProfile";

type Params = { onDone: () => void };

// The name is the only field the server saves for now. Nothing is sent when
// it did not change.
export const useEditProfileForm = ({ onDone }: Params) => {
    const { user } = useAuth();
    const updateProfile = useUpdateProfile();
    const form = useForm<EditProfileFormValues>({
        defaultValues: { name: user.name },
    });

    const onSubmit = async (values: EditProfileFormValues) => {
        const data = UserUpdateSchema.safeParse({ name: values.name.trim() });
        if (!data.success) {
            form.setError("name", { message: Validation.NAME_INVALID });
            return;
        }
        if (data.data.name === user.name) return onDone();

        try {
            await updateProfile.mutateAsync(data.data);
            onDone();
        } catch {
            form.setError("root", {
                message: EDIT_PROFILE_MESSAGES.UPDATE_FAILED,
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
