import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AreaSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { buildUploadFormData } from "@/features/assets/utils/buildUploadFormData";
import type { SaveAreaInput } from "../types/saveAreaInput";
import { invalidateAreas } from "../utils/invalidateAreas";

type ReplaceAreaInput = SaveAreaInput & { areaId: string };

export const useReplace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // The stamp and the PNG carry the size, which may differ from the saved one.
        mutationFn: async ({
            areaId,
            image,
            data,
        }: ReplaceAreaInput): Promise<AreaSummary> => {
            const res = await api.put(
                `/library/areas/${areaId}`,
                buildUploadFormData(image, data),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.area;
        },
        onSuccess: () => invalidateAreas(queryClient),
    });
};
