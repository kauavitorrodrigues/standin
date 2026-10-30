import { useQuery } from "@tanstack/react-query";
import type { GlobalSettings } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { GLOBAL_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

export const useAdminGlobalSettings = () =>
    useQuery({
        queryKey: [GLOBAL_SETTINGS_QUERY_KEY, "admin"] as const,
        queryFn: async (): Promise<GlobalSettings> => {
            const { data } = await api.get("/admin/settings");
            return data.settings;
        },
    });
