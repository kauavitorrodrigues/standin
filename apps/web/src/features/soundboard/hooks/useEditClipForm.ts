import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SoundboardClipFormSchema } from "@standin/contracts";
import type {
    SoundboardClip,
    SoundboardClipFormValues,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import { SoundboardMutations } from "../mutations";
import { buildClipUpdate } from "../utils/buildClipUpdate";
import { clipToFormValues } from "../utils/clipToFormValues";
import { formValuesToDraft } from "../utils/formValuesToDraft";

type Options = {
    clip: Pick<SoundboardClip, "id" | "name" | "icon" | "volume" | "scope">;
    onDone: () => void;
};

/** The edit form of a clip: it sends only the fields that changed. */
export const useEditClipForm = ({ clip, onDone }: Options) => {
    const updateMutation = SoundboardMutations.update();
    const initial = clipToFormValues(clip);
    const form = useForm<SoundboardClipFormValues>({
        resolver: zodResolver(SoundboardClipFormSchema),
        defaultValues: initial,
    });
    const values = useWatch({ control: form.control });
    const update = buildClipUpdate(
        formValuesToDraft(initial),
        formValuesToDraft({ ...initial, ...values })
    );

    const onSubmit = async () => {
        if (!update) return;
        try {
            await updateMutation.mutateAsync({
                scope: clip.scope,
                clipId: clip.id,
                body: update,
            });
            toast.add({ title: SOUNDBOARD_MESSAGES.UPDATED, type: "success" });
            onDone();
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ??
                    SOUNDBOARD_MESSAGES.UPDATE_FAILED,
                type: "error",
            });
        }
    };

    return {
        form,
        submit: form.handleSubmit(onSubmit),
        isSubmitting: form.formState.isSubmitting,
        hasChanges: update !== null,
    };
};
