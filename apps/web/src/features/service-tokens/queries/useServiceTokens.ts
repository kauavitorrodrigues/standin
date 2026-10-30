import { useQuery } from "@tanstack/react-query";
import type { ServiceToken } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SERVICE_TOKENS_PATH } from "../consts/paths";
import { SERVICE_TOKENS_QUERY_KEY } from "../consts/queryKeys";

// The service tokens, never with the clear token: only its prefix.
export const useServiceTokens = () => {
    const query = useQuery({
        queryKey: [SERVICE_TOKENS_QUERY_KEY, "list"],
        queryFn: async (): Promise<{ serviceTokens: ServiceToken[] }> => {
            const res = await api.get(SERVICE_TOKENS_PATH);
            return res.data;
        },
    });

    const serviceTokens = query.data?.serviceTokens ?? [];

    return { ...query, serviceTokens };
};
