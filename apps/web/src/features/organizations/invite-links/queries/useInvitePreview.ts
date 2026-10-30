import { useQuery } from "@tanstack/react-query";
import type { OrganizationInvitePreview } from "@standin/contracts";
import { api } from "@/lib/axios/api";

// What a link shows before the person signs up. It fails with the reason the
// link cannot be used.
export const useOrganizationInvitePreview = (token: string) =>
    useQuery({
        queryKey: ["organizationInvitePreview", token] as const,
        queryFn: async (): Promise<OrganizationInvitePreview> => {
            const res = await api.get(
                `/organization-invites/${encodeURIComponent(token)}`
            );
            return res.data.invite;
        },
        retry: false,
    });
