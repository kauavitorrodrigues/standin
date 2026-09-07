import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { updateMessage } from "@/features/chat/utils/messagesCache";
import { toggleReactionSummary } from "@/features/chat/utils/toggleReactionSummary";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";

type ToggleReactionInput = {
    conversationId: string;
    messageId: string;
    emoji: string;
    reactedByMe: boolean;
};

type ReactionRequest = (params: {
    url: string;
    emoji: string;
}) => Promise<unknown>;

const reactionRequestByIntent: Record<"add" | "remove", ReactionRequest> = {
    add: ({ url, emoji }) => api.post(url, { emoji }),
    remove: ({ url, emoji }) =>
        api.delete(`${url}/${encodeURIComponent(emoji)}`),
};

export const useToggleReaction = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<ToggleReactionInput, void>({
        conversationId: (input) => input.conversationId,
        mutationFn: async ({
            conversationId,
            messageId,
            emoji,
            reactedByMe,
        }) => {
            const url = `/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}/reactions`;
            const intent = reactedByMe ? "remove" : "add";
            await reactionRequestByIntent[intent]({ url, emoji });
        },
        // A reaction can only be toggled from a message already rendered on
        // screen, so its conversation cache is guaranteed to be populated.
        apply: (data, { messageId, emoji, reactedByMe }) => ({
            data: updateMessage(data!, messageId, (message) => ({
                ...message,
                reactions: toggleReactionSummary(
                    message.reactions,
                    emoji,
                    reactedByMe
                ),
            })),
            meta: undefined,
        }),
    });
};
