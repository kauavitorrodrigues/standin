import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AreaRenameBody, AreaSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateAreas } from "../utils/invalidateAreas";

type RenameAreaInput = AreaRenameBody & { areaId: string };

export const useRename = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            areaId,
            name,
        }: RenameAreaInput): Promise<AreaSummary> => {
            const res = await api.patch(`/library/areas/${areaId}`, { name });
            return res.data.area;
        },
        onSuccess: () => invalidateAreas(queryClient),
    });
};
