import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { SOUNDBOARD_CLIPS_QUERY_KEY } from "../consts/queryKeys";
import { removeClip } from "../lib/removeClip";
import type { ClipRef } from "../types/clip";

export const useDelete = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganizationId();

    return useMutation({
        mutationFn: (ref: ClipRef): Promise<void> =>
            removeClip(organizationId, ref),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [SOUNDBOARD_CLIPS_QUERY_KEY],
            }),
    });
};
