import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    GlobalSettings,
    GlobalSettingsUpdateInput,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { GLOBAL_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

export const useUpdateGlobalSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: GlobalSettingsUpdateInput
        ): Promise<GlobalSettings> => {
            const res = await api.put("/admin/settings", data);
            return res.data.settings;
        },
        // The public and capability answers change with the switches.
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [GLOBAL_SETTINGS_QUERY_KEY],
            }),
    });
};
