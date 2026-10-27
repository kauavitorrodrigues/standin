import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceSettings } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

export const spaceSettingsQueryOptions = (spaceId: string, enabled: boolean) =>
    queryOptions({
        queryKey: [SPACE_SETTINGS_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceSettings> => {
            const res = await api.get(`/spaces/${spaceId}/settings`);
            return res.data.settings;
        },
        enabled: !!spaceId && enabled,
    });

export const useSpaceSettings = (spaceId: string, enabled: boolean) => {
    const query = useQuery(spaceSettingsQueryOptions(spaceId, enabled));
    return { ...query, settings: query.data };
};
