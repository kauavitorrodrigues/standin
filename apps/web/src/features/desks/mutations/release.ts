import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { spaceDesksQueryKey } from "../queries/useSpaceDesks";
import type { Desk } from "../types/desk";

export const useRelease = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (mapAssetId: string): Promise<string> => {
            await api.delete(`/spaces/${spaceId}/desks/${mapAssetId}/claim`);
            return mapAssetId;
        },
        onSuccess: (mapAssetId) =>
            queryClient.setQueryData<Desk[]>(
                spaceDesksQueryKey(spaceId),
                (current) =>
                    (current ?? []).filter(
                        (desk) => desk.mapAssetId !== mapAssetId
                    )
            ),
    });
};
