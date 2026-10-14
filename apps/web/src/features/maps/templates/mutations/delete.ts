import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { TEMPLATE_DETAILS_QUERY_KEY } from "../queries/useDetails";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const useDelete = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Deletes the template with its map and thumbnail.
        mutationFn: async (templateId: string): Promise<void> => {
            await api.delete(`/templates/${templateId}`);
        },
        onSuccess: (_data, templateId) => {
            queryClient.removeQueries({
                queryKey: [TEMPLATE_DETAILS_QUERY_KEY, templateId],
            });
            return invalidateTemplates(queryClient);
        },
    });
};
