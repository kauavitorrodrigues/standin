import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { SERVICE_TOKENS_PATH } from "../consts/paths";
import { invalidateServiceTokens } from "../utils/invalidateServiceTokens";

// Gives the token a new secret and resolves with the new clear token string
// alone. As in the creation, gcTime 0 drops the mutation from the cache when
// nobody observes it, and the caller resets it, so the secret is kept in
// component state only.
export const useRegenerateServiceToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        gcTime: 0,
        mutationFn: async (tokenId: string): Promise<string> => {
            const res = await api.post<{ token: string }>(
                `${SERVICE_TOKENS_PATH}/${tokenId}/regenerate`
            );
            return res.data.token;
        },
        onSuccess: () => invalidateServiceTokens(queryClient),
    });
};
