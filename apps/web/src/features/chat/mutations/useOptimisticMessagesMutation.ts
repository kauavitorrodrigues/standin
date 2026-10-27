import {
    useMutation,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";
import {
    messagesListQueryKey,
    type MessagesQueryKey,
} from "@/features/chat/queries";
import type { MessagesData } from "@/features/chat/utils/messagesCache";

type Context<TMeta> = {
    queryKey: MessagesQueryKey;
    previous: MessagesData | undefined;
    meta: TMeta;
};

type Config<TInput, TOutput, TMeta> = {
    conversationId: (input: TInput) => string;
    // Set when the message lives in a thread list instead of the main one.
    threadParentId?: (input: TInput) => string | undefined;
    mutationFn: (input: TInput) => Promise<TOutput>;
    apply: (
        data: MessagesData | undefined,
        input: TInput
    ) => { data: MessagesData; meta: TMeta };
    // Runs once the request succeeded, for a change to a cache other than the
    // list this mutation edited.
    onSuccess?: (
        queryClient: QueryClient,
        output: TOutput,
        input: TInput
    ) => void;
    reconcile?: (
        data: MessagesData,
        output: TOutput,
        input: TInput,
        meta: TMeta
    ) => MessagesData;
};

// Shared optimistic-update plumbing for chat mutations: snapshot the
// affected conversation's message cache, apply a local change immediately,
// then either reconcile it with the server response or roll it back.
export function useOptimisticMessagesMutation<
    TInput,
    TOutput,
    TMeta = undefined,
>(config: Config<TInput, TOutput, TMeta>) {
    const queryClient = useQueryClient();

    const reconcileWithServer = (
        output: TOutput,
        input: TInput,
        context: Context<TMeta> | undefined
    ) => {
        const { reconcile } = config;
        config.onSuccess?.(queryClient, output, input);
        if (!reconcile || !context) return;

        queryClient.setQueryData<MessagesData>(context.queryKey, (data) => {
            if (!data) return data;
            return reconcile(data, output, input, context.meta);
        });
    };

    return useMutation<TOutput, unknown, TInput, Context<TMeta>>({
        mutationFn: config.mutationFn,
        onMutate: async (input) => {
            const queryKey = messagesListQueryKey(
                config.conversationId(input),
                config.threadParentId?.(input)
            );
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<MessagesData>(queryKey);
            const { data, meta } = config.apply(previous, input);
            queryClient.setQueryData<MessagesData>(queryKey, data);

            return { queryKey, previous, meta };
        },
        onError: (_error, _input, context) => {
            if (!context) return;
            queryClient.setQueryData(context.queryKey, context.previous);
            // The rolled-back snapshot can itself be stale if another
            // mutation or a peer update landed while this one was in
            // flight, so refetch instead of trusting it as final.
            queryClient.invalidateQueries({ queryKey: context.queryKey });
        },
        onSuccess: reconcileWithServer,
    });
}
