import type { QueryClient } from "@tanstack/react-query";
import { SERVICE_TOKENS_QUERY_KEY } from "../consts/queryKeys";

export const invalidateServiceTokens = (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: [SERVICE_TOKENS_QUERY_KEY] });
