import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SoundboardClip } from "@standin/contracts";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SOUNDBOARD_CLIPS_QUERY_KEY } from "../consts/queryKeys";
import { patchClip } from "../lib/patchClip";
import type { UpdateClipInput } from "../types/clip";

export const useUpdate = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganizationId();

    return useMutation({
        mutationFn: (input: UpdateClipInput): Promise<SoundboardClip> =>
            patchClip(organizationId, input),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [SOUNDBOARD_CLIPS_QUERY_KEY],
            }),
    });
};
