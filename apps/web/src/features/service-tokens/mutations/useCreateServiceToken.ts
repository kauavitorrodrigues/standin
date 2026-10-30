import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { SERVICE_TOKENS_PATH } from "../consts/paths";
import type { CreateTokenPayload } from "../types";
import { invalidateServiceTokens } from "../utils/invalidateServiceTokens";

// Creates the token and hands back ONLY the clear token, once. The mutation
// resolves with the clear token string alone, and gcTime 0 drops
// the mutation from the cache as soon as nobody observes it, so the secret is
// kept by the caller alone, in component state.
export const useCreateServiceToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        gcTime: 0,
        mutationFn: async (payload: CreateTokenPayload): Promise<string> => {
            const res = await api.post<{ token: string }>(
                SERVICE_TOKENS_PATH,
                payload
            );
            return res.data.token;
        },
        onSuccess: () => invalidateServiceTokens(queryClient),
    });
};
