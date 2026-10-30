import type { SoundboardClip } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import { SoundboardMutations } from "../mutations";

/** Deleting a clip: the call and what the person is told about it. */
export const useDeleteClipConfirm = (
    clip: Pick<SoundboardClip, "id" | "scope">
) => {
    const deleteMutation = SoundboardMutations.delete();

    const confirm = async () => {
        try {
            await deleteMutation.mutateAsync({
                scope: clip.scope,
                clipId: clip.id,
            });
            toast.add({ title: SOUNDBOARD_MESSAGES.DELETED, type: "success" });
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ??
                    SOUNDBOARD_MESSAGES.DELETE_FAILED,
                type: "error",
            });
        }
    };

    return { confirm, isPending: deleteMutation.isPending };
};
