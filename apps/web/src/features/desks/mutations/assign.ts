import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeskPayload } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { spaceDesksQueryKey } from "../queries/useSpaceDesks";
import type { Desk } from "../types/desk";
import { applyDeskEvent } from "../utils/applyDeskEvent";

type AssignInput = { mapAssetId: string; userId: string };

// The owner of the organization gives a free desk to a member.
export const useAssign = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            mapAssetId,
            userId,
        }: AssignInput): Promise<DeskPayload> => {
            const res = await api.post(
                `/spaces/${spaceId}/desks/${mapAssetId}/assign`,
                { userId }
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
