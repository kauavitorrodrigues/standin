import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { getRootErrorMessage } from "@/features/assets/utils/getRootErrorMessage";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import { useSaveAvatar } from "../mutations/saveAvatar";
import type { AvatarEditorFormValues } from "../types/draft";
import type { AvatarEditor, MyAvatar } from "../types/editor";
import { buildConfig, buildFormValues } from "../utils/draft";

type Params = {
    editor: AvatarEditor;
    // Closes the dialog.
    onDone: () => void;
    // Called with the saved avatar. The cached avatar is already updated by
    // then, which is what redraws the local player in the game.
    onSaved?: (avatar: MyAvatar) => void;
};

// The draft of the editor. Nothing goes to the server until the person
// confirms, so the game keeps showing the old sheet meanwhile. Canceling just
// closes the dialog and the draft is thrown away with the form.
export const useAvatarEditorForm = ({ editor, onDone, onSaved }: Params) => {
    const saveAvatar = useSaveAvatar();
    const form = useForm<AvatarEditorFormValues>({
        defaultValues: buildFormValues(editor),
    });

    const submit = form.handleSubmit(async (values) => {
        try {
            const saved = await saveAvatar.mutateAsync(buildConfig(values));
            onSaved?.(saved);
            onDone();
        } catch (error) {
            // The form stays open with the draft untouched.
            toast.add({
                title: getRootErrorMessage(
                    error,
                    AVATAR_EDITOR_MESSAGES.SAVE_FAILED
                ),
                type: "error",
            });
        }
    });

    return {
        form,
        isSubmitting: form.formState.isSubmitting,
        isDirty: form.formState.isDirty,
        submit,
    };
};
