import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { SERVICE_TOKENS_PATH } from "../consts/paths";
import { invalidateServiceTokens } from "../utils/invalidateServiceTokens";

// Removes the token for good, an active one included.
export const useDeleteServiceToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tokenId: string) => {
            await api.delete(`${SERVICE_TOKENS_PATH}/${tokenId}`);
        },
        onSuccess: () => invalidateServiceTokens(queryClient),
    });
};
