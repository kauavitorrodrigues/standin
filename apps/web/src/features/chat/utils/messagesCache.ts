import type { InfiniteData } from "@tanstack/react-query";
import type {
    ConversationMessagesListResponse,
    MessageWithDetails,
} from "@standin/contracts";
import { EMPTY_MESSAGES_PAGE } from "@/features/chat/consts/messages";

export type MessagesData = InfiniteData<ConversationMessagesListResponse>;

export const mapMessages = (
    data: MessagesData,
    map: (message: MessageWithDetails) => MessageWithDetails
): MessagesData => ({
    ...data,
    pages: data.pages.map((page) => ({
        ...page,
        messages: page.messages.map(map),
    })),
});

export const updateMessage = (
    data: MessagesData,
    messageId: string,
    update: (message: MessageWithDetails) => MessageWithDetails
): MessagesData =>
    mapMessages(data, (message) =>
        message.id === messageId ? update(message) : message
    );

export const removeMessage = (
    data: MessagesData,
    messageId: string
): MessagesData => ({
    ...data,
    pages: data.pages.map((page) => ({
        ...page,
        messages: page.messages.filter((message) => message.id !== messageId),
    })),
});

export const prependMessage = (
    data: MessagesData | undefined,
    message: MessageWithDetails
): MessagesData => {
    const [firstPage = EMPTY_MESSAGES_PAGE, ...restPages] = data?.pages ?? [];

    return {
        pageParams: data?.pageParams ?? [undefined],
        pages: [
            { ...firstPage, messages: [message, ...firstPage.messages] },
            ...restPages,
        ],
    };
};
