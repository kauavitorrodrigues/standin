import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteApp } from "../lib/spotifyApi";
import { invalidateSpotifyStatus } from "../lib/invalidateStatus";

export const useRemoveApp = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteApp(organizationId),
        onSuccess: () => invalidateSpotifyStatus(queryClient, organizationId),
    });
};
