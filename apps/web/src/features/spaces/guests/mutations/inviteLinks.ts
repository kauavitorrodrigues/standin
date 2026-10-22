import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    SpaceInviteLink,
    SpaceInviteLinkCreated,
    SpaceInviteLinkCreateSchemaType,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { INVITE_LINKS_QUERY_KEY } from "../consts/queryKeys";

export const useCreateInviteLink = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: Partial<SpaceInviteLinkCreateSchemaType> = {}
        ): Promise<SpaceInviteLinkCreated> => {
            const res = await api.post(`/spaces/${spaceId}/invite-links`, data);
            return res.data.link;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [INVITE_LINKS_QUERY_KEY, spaceId],
            }),
    });
};

export const useRevokeInviteLink = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (linkId: string): Promise<SpaceInviteLink> => {
            const res = await api.delete(
                `/spaces/${spaceId}/invite-links/${linkId}`
            );
            return res.data.link;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [INVITE_LINKS_QUERY_KEY, spaceId],
            }),
    });
};
