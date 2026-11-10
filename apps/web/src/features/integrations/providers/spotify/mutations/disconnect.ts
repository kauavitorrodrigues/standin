import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMyConnection } from "../lib/spotifyApi";
import { invalidateSpotifyStatus } from "../lib/invalidateStatus";

export const useDisconnect = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteMyConnection(organizationId),
        onSuccess: () => invalidateSpotifyStatus(queryClient, organizationId),
    });
};
