import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapTemplateDataSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { CreateTemplateResult } from "../types/createTemplateResult";
import { invalidateTemplates } from "../utils/invalidateTemplates";

export const useCreate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: MapTemplateDataSchemaType
        ): Promise<CreateTemplateResult> => {
            const res = await api.post("/templates", data);
            return res.data;
        },
        onSuccess: () => invalidateTemplates(queryClient),
    });
};
