import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import type { SetThumbnailInput } from "../types/setThumbnailInput";
import type { SetThumbnailResult } from "../types/setThumbnailResult";
import { buildThumbnailFormData } from "../utils/buildThumbnailFormData";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const useSetThumbnail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            templateId,
            thumbnail,
        }: SetThumbnailInput): Promise<SetThumbnailResult> => {
            const res = await api.put(
                `/templates/${templateId}/thumbnail`,
                buildThumbnailFormData(thumbnail),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateTemplates(queryClient),
    });
};
