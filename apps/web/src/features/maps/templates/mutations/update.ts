import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapTemplate } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { UpdateTemplateInput } from "../types/updateTemplateInput";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const useUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // The server replaces name and description together, so the caller
        // sends both.
        mutationFn: async ({
            templateId,
            ...data
        }: UpdateTemplateInput): Promise<MapTemplate> => {
            const res = await api.patch(`/templates/${templateId}`, data);
            return res.data.template;
        },
        onSuccess: () => invalidateTemplates(queryClient),
    });
};
