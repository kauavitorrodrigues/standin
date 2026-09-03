import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    messagesQueryKey,
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
    mutationFn: (input: TInput) => Promise<TOutput>;
    apply: (
        data: MessagesData | undefined,
        input: TInput
    ) => { data: MessagesData; meta: TMeta };
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
        if (!reconcile || !context) return;

        queryClient.setQueryData<MessagesData>(context.queryKey, (data) => {
            if (!data) return data;
            return reconcile(data, output, input, context.meta);
        });
    };

    return useMutation<TOutput, unknown, TInput, Context<TMeta>>({
        mutationFn: config.mutationFn,
        onMutate: async (input) => {
            const queryKey = messagesQueryKey(config.conversationId(input));
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<MessagesData>(queryKey);
            const { data, meta } = config.apply(previous, input);
            queryClient.setQueryData<MessagesData>(queryKey, data);

            return { queryKey, previous, meta };
        },
        onError: (_error, _input, context) => {
            if (!context) return;
            queryClient.setQueryData(context.queryKey, context.previous);
        },
        onSuccess: reconcileWithServer,
    });
}
