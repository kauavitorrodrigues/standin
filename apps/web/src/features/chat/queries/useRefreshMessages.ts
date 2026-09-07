import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CONVERSATION_MESSAGES_QUERY_KEY } from "@/features/chat/queries/queryKey";

// Refetches every conversation already in cache, so the refresh button
// works the same whether the user is on the list or inside a thread.
export const useRefreshMessages = () => {
    const queryClient = useQueryClient();

    return useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: [CONVERSATION_MESSAGES_QUERY_KEY],
        });
    }, [queryClient]);
};
