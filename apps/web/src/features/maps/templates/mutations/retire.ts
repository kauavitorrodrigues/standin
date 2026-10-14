import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapTemplate } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const useRetire = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Takes a published template out of the list of the organizations.
        mutationFn: async (templateId: string): Promise<MapTemplate> => {
            const res = await api.post(`/templates/${templateId}/retire`);
            return res.data.template;
        },
        onSuccess: () => invalidateTemplates(queryClient),
    });
};
