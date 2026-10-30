import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SoundboardClip } from "@standin/contracts";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SOUNDBOARD_CLIPS_QUERY_KEY } from "../consts/queryKeys";
import { postClip } from "../lib/postClip";
import type { UploadClipInput } from "../types/upload";

export const useCreate = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganizationId();

    return useMutation({
        mutationFn: (input: UploadClipInput): Promise<SoundboardClip> =>
            postClip(organizationId, input),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [SOUNDBOARD_CLIPS_QUERY_KEY],
            }),
    });
};
