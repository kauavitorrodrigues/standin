import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    SpaceSettings,
    SpaceSettingsUpdateSchemaType,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_SETTINGS_QUERY_KEY } from "../consts/queryKeys";

export const useUpdateSpaceSettings = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: SpaceSettingsUpdateSchemaType
        ): Promise<SpaceSettings> => {
            const res = await api.patch(`/spaces/${spaceId}/settings`, data);
            return res.data.settings;
        },
        onSuccess: (settings) =>
            queryClient.setQueryData(
                [SPACE_SETTINGS_QUERY_KEY, spaceId],
                settings
            ),
    });
};
