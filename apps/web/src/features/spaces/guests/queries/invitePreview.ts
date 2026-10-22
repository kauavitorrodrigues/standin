import { queryOptions, useQuery } from "@tanstack/react-query";
import type { InvitePreview } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { INVITE_PREVIEW_QUERY_KEY } from "../consts/queryKeys";

export const invitePreviewQueryOptions = (token: string) =>
    queryOptions({
        queryKey: [INVITE_PREVIEW_QUERY_KEY, token],
        queryFn: async (): Promise<InvitePreview> => {
            const res = await api.get(`/invites/${encodeURIComponent(token)}`);
            return res.data.invite;
        },
        enabled: !!token,
        // An invite that fails (expired, revoked) will not get better by retrying.
        retry: false,
    });

export const useInvitePreview = (token: string) => {
    const query = useQuery(invitePreviewQueryOptions(token));
    return { ...query, invite: query.data };
};
