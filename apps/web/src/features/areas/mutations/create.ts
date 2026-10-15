import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AreaSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { buildUploadFormData } from "@/features/assets/utils/buildUploadFormData";
import type { SaveAreaInput } from "../types/saveAreaInput";
import { invalidateAreas } from "../utils/invalidateAreas";

export const useCreate = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({
            image,
            data,
        }: SaveAreaInput): Promise<AreaSummary> => {
            const res = await api.post(
                `${apiBase}/areas`,
                buildUploadFormData(image, data),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.area;
        },
        onSuccess: () => invalidateAreas(queryClient),
    });
};
