import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceGuest } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_GUESTS_QUERY_KEY } from "../consts/queryKeys";

export const GUEST_ANSWERS = {
    ADMIT: "admit",
    DENY: "deny",
    RESET: "reset",
} as const;

export type GuestAnswer = (typeof GUEST_ANSWERS)[keyof typeof GUEST_ANSWERS];

type AnswerInput = { guestId: string; answer: GuestAnswer };

// A host answers a request, or reopens one that was denied or lapsed.
export const useAnswerGuest = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            guestId,
            answer,
        }: AnswerInput): Promise<SpaceGuest> => {
            const res = await api.post(
                `/spaces/${spaceId}/guests/${guestId}/${answer}`
            );
            return res.data.guest;
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
            }),
    });
};
