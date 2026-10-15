import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeskPayload } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { spaceDesksQueryKey } from "../queries/useSpaceDesks";
import type { Desk } from "../types/desk";
import { applyDeskEvent } from "../utils/applyDeskEvent";

type ClaimInput = { mapAssetId: string; swap: boolean };

export const useClaim = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            mapAssetId,
            swap,
        }: ClaimInput): Promise<DeskPayload> => {
            const res = await api.post(
                `/spaces/${spaceId}/desks/${mapAssetId}/claim`,
                { swap }
            );
            return res.data;
        },
        // The socket event does the same, applying it twice changes nothing.
        onSuccess: (payload) =>
            queryClient.setQueryData<Desk[]>(
                spaceDesksQueryKey(spaceId),
                (current) =>
                    applyDeskEvent(current ?? [], { type: "claimed", payload })
            ),
    });
};
