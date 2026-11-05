import { useRef } from "react";
import type { BaseSyntheticEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useCompleteTask } from "@/features/onboarding/hooks/useCompleteTask";
import { getRootErrorMessage } from "@/features/assets/utils/getRootErrorMessage";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import { useSaveAvatar } from "../mutations/saveAvatar";
import type { AvatarEditorFormValues } from "../types/draft";
import type { AvatarEditor, MyAvatar } from "../types/editor";
import { buildConfig, buildFormValues, isDraftEdited } from "../utils/draft";

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
    const completeTask = useCompleteTask();
    const form = useForm<AvatarEditorFormValues>({
        defaultValues: buildFormValues(editor),
    });

    const handleSave = form.handleSubmit(async (values) => {
        try {
            const saved = await saveAvatar.mutateAsync(buildConfig(values));
            completeTask(ONBOARDING_TASKS.PERSONALIZE_AVATAR);
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

    // The discard dialog can ask to save while a save is running, which would
    // repeat the request and its side effects.
    const isSaving = useRef(false);
    const submit = async (event?: BaseSyntheticEvent) => {
        // Stops a native submit from reloading the page.
        event?.preventDefault();
        if (isSaving.current) return;
        isSaving.current = true;
        try {
            await handleSave(event);
        } finally {
            isSaving.current = false;
        }
    };

    // Compared with the saved avatar instead of using the form's dirty flag,
    // which stays set after a change is undone.
    const baseId = useWatch({ control: form.control, name: "baseId" });
    const parts = useWatch({ control: form.control, name: "parts" });
    const isDirty = isDraftEdited({ baseId, parts }, editor);

    return {
        form,
        isSubmitting: form.formState.isSubmitting,
        isDirty,
        submit,
    };
};
