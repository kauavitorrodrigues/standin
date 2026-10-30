import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SoundboardClipFormSchema } from "@standin/contracts";
import type {
    SoundboardClipFormValues,
    SoundboardClipScope,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { SOUNDBOARD_CLIP_FORM_DEFAULTS } from "../consts/form";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import { SoundboardMutations } from "../mutations";
import { stripExtension } from "@/utils/stripExtension";
import { formValuesToDraft } from "../utils/formValuesToDraft";
import { resolveUploadBlockReason } from "../utils/resolveUploadBlockReason";
import { resolveUploadPhase } from "../utils/resolveUploadPhase";
import type { ClipEditorState } from "./useClipEditor";

type Options = {
    scope: SoundboardClipScope;
    editor: ClipEditorState;
    onDone: () => void;
};

/**
 * The upload form. The editor holds the file and the trimmed range, the form
 * holds the name, icon and volume, and its submit is the only thing that
 * builds and sends the upload.
 */
export const useUploadClipForm = ({ scope, editor, onDone }: Options) => {
    const createMutation = SoundboardMutations.create();
    const [progress, setProgress] = useState<number | null>(null);
    const form = useForm<SoundboardClipFormValues>({
        resolver: zodResolver(SoundboardClipFormSchema),
        defaultValues: SOUNDBOARD_CLIP_FORM_DEFAULTS,
    });
    const volume = useWatch({ control: form.control, name: "volume" });
    const { setPlaybackVolume } = editor;

    // The preview of the selection plays at the volume the clip will have.
    useEffect(() => setPlaybackVolume(volume), [volume, setPlaybackVolume]);

    const pickFile = async (file: File) => {
        const loaded = await editor.loadFile(file);
        // A failed load keeps whatever name was there.
        if (!loaded) return;
        form.setValue("name", stripExtension(file.name), {
            shouldValidate: true,
        });
    };

    const onSubmit = async (values: SoundboardClipFormValues) => {
        try {
            const bytes = await editor.exportClip();
            setProgress(0);
            await createMutation.mutateAsync({
                scope,
                bytes,
                ...formValuesToDraft(values),
                onProgress: setProgress,
            });
            toast.add({ title: SOUNDBOARD_MESSAGES.UPLOADED, type: "success" });
            onDone();
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ??
                    SOUNDBOARD_MESSAGES.UPLOAD_FAILED,
                type: "error",
            });
        } finally {
            setProgress(null);
        }
    };

    const { isSubmitting } = form.formState;
    const isReady = editor.status === "ready";
    const limitReason = resolveUploadBlockReason(editor.report);

    return {
        form,
        submit: form.handleSubmit(onSubmit),
        pickFile,
        progress,
        phase: resolveUploadPhase({ isSubmitting, progress }),
        isSubmitting,
        // The limits only matter once there is a selection to measure.
        blockReason: isReady ? limitReason : null,
        canSubmit: isReady && limitReason === null,
    };
};
