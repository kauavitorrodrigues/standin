import { queryOptions, useQuery } from "@tanstack/react-query";
import type { PublicGlobalSettings } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { GLOBAL_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

// What the sign up page reads before anyone is signed in. A failure leaves the
// form as it is: the API still refuses a closed sign up.
export const publicGlobalSettingsQueryOptions = () =>
    queryOptions({
        queryKey: [GLOBAL_SETTINGS_QUERY_KEY, "public"] as const,
        queryFn: async (): Promise<PublicGlobalSettings> => {
            const { data } = await api.get("/global-settings/settings");
            return data.settings;
        },
        retry: false,
    });

export const usePublicGlobalSettings = () =>
    useQuery(publicGlobalSettingsQueryOptions());
