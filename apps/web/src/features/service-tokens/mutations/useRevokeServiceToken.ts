import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { SERVICE_TOKENS_PATH } from "../consts/paths";
import { invalidateServiceTokens } from "../utils/invalidateServiceTokens";

// Revokes the token. The row stays in the list as revoked.
export const useRevokeServiceToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tokenId: string) => {
            await api.post(`${SERVICE_TOKENS_PATH}/${tokenId}/revoke`);
        },
        onSuccess: () => invalidateServiceTokens(queryClient),
    });
};
