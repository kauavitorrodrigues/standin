import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { AREA_DETAILS_QUERY_KEY } from "../queries/useDetails";
import { invalidateAreas } from "../utils/invalidateAreas";

export const useRemove = () => {
    const queryClient = useQueryClient();
    const { apiBase, key } = useLibraryScope();

    return useMutation({
        // Retires the area. The maps that already placed it keep their copy.
        mutationFn: async (areaId: string): Promise<void> => {
            await api.delete(`${apiBase}/areas/${areaId}`);
        },
        onSuccess: (_data, areaId) => {
            queryClient.removeQueries({
                queryKey: [AREA_DETAILS_QUERY_KEY, key, areaId],
            });
            return invalidateAreas(queryClient);
        },
    });
};
