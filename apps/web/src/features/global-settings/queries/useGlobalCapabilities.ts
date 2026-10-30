import { useQuery } from "@tanstack/react-query";
import type { GlobalCapabilities } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { GLOBAL_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

// While it loads, or if it fails, the buttons stay: the API is the one that
// refuses.
const OPEN: GlobalCapabilities = {
    canCreateOrganization: true,
    canCreateSpace: true,
};

export const useGlobalCapabilities = (): GlobalCapabilities => {
    const query = useQuery({
        queryKey: [GLOBAL_SETTINGS_QUERY_KEY, "capabilities"] as const,
        queryFn: async (): Promise<GlobalCapabilities> => {
            const { data } = await api.get("/global-settings/capabilities");
            return data.capabilities;
        },
        retry: false,
    });
    return query.data ?? OPEN;
};
