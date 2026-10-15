import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapTemplate } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const usePublish = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Makes a draft template available to the organizations.
        mutationFn: async (templateId: string): Promise<MapTemplate> => {
            const res = await api.post(`/templates/${templateId}/publish`);
            return res.data.template;
        },
        onSuccess: () => invalidateTemplates(queryClient),
    });
};
