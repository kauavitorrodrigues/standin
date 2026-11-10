import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpotifyAppSave } from "@standin/contracts";
import { SPOTIFY_OWNER_QUERY_KEY } from "../consts/queryKeys";
import { invalidateSpotifyStatus } from "../lib/invalidateStatus";
import { putApp } from "../lib/spotifyApi";

export const useSaveApp = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: SpotifyAppSave) => putApp(organizationId, input),
        onSuccess: (status) => {
            queryClient.setQueryData(
                [SPOTIFY_OWNER_QUERY_KEY, organizationId],
                status
            );
            // A new app may have dropped the connections, the member view changes.
            return invalidateSpotifyStatus(queryClient, organizationId);
        },
    });
};
