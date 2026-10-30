import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    OrganizationInviteLink,
    OrganizationInviteLinkCreated,
    OrganizationInviteLinkCreateInput,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_INVITE_LINKS_QUERY_KEY } from "../queries/useInviteLinks";

export const useCreateOrganizationInviteLink = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: Partial<OrganizationInviteLinkCreateInput> = {}
        ): Promise<OrganizationInviteLinkCreated> => {
            const res = await api.post(
                `/organizations/${organizationId}/invite-links`,
                data
            );
            return res.data.link;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_INVITE_LINKS_QUERY_KEY, organizationId],
            }),
    });
};

export const useRevokeOrganizationInviteLink = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (linkId: string): Promise<OrganizationInviteLink> => {
            const res = await api.delete(
                `/organizations/${organizationId}/invite-links/${linkId}`
            );
            return res.data.link;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_INVITE_LINKS_QUERY_KEY, organizationId],
            }),
    });
};
