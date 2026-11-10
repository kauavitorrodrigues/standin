import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePersonConnection } from "../lib/spotifyApi";
import { invalidateSpotifyStatus } from "../lib/invalidateStatus";

// The owner takes a person off their place.
export const useRemovePerson = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) =>
            deletePersonConnection(organizationId, userId),
        onSuccess: () => invalidateSpotifyStatus(queryClient, organizationId),
    });
};
