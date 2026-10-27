import type { InfiniteData } from "@tanstack/react-query";
import type {
    ConversationMessagesListResponse,
    MessageSender,
    MessageWithDetails,
    ThreadSummary,
} from "@standin/contracts";
import { EMPTY_MESSAGES_PAGE } from "@/features/chat/consts/messages";

export type MessagesData = InfiniteData<ConversationMessagesListResponse>;

// Returns the very same `page` reference when `map` didn't actually change
// any of its messages, instead of always allocating a new page/array.
// Downstream memoization (useConversationMessages, groupMessagesBySender,
// React.memo(MessageGroup)) relies on untouched messages and pages keeping
// their object identity.
const mapPageMessages = (
    page: ConversationMessagesListResponse,
    map: (message: MessageWithDetails) => MessageWithDetails
): ConversationMessagesListResponse => {
    let changed = false;
    const messages = page.messages.map((message) => {
        const next = map(message);
        if (next !== message) changed = true;
        return next;
    });

    return changed ? { ...page, messages } : page;
};

export const mapMessages = (
    data: MessagesData,
    map: (message: MessageWithDetails) => MessageWithDetails
): MessagesData => ({
    ...data,
    pages: data.pages.map((page) => mapPageMessages(page, map)),
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
    messageId: string,
    // Lets a caller that only knows the claimed sender (a peer delete
    // payload) refuse to drop a message actually sent by someone else.
    guard: (message: MessageWithDetails) => boolean = () => true
): MessagesData => ({
    ...data,
    pages: data.pages.map((page) => {
        if (!page.messages.some((message) => message.id === messageId)) {
            return page;
        }
        return {
            ...page,
            messages: page.messages.filter(
                (message) => message.id !== messageId || !guard(message)
            ),
        };
    }),
});

// The parent's reply count and last reply, as the server worked them out.
export const applyThreadSummary = (
    data: MessagesData,
    { parentId, replyCount, lastReplyAt, lastReplyPreview }: ThreadSummary
): MessagesData =>
    updateMessage(data, parentId, (message) => ({
        ...message,
        replyCount,
        lastReplyAt,
        lastReplyPreview,
    }));

const withMissingSender = (
    users: Record<string, MessageSender>,
    sender: MessageSender | undefined
): Record<string, MessageSender> => {
    if (!sender || users[sender.id]) return users;
    return { ...users, [sender.id]: sender };
};

export const prependMessage = (
    data: MessagesData | undefined,
    message: MessageWithDetails,
    // Only needed for a message arriving over P2P: it isn't backed by a
    // fetched page, so its sender may not be in `users` yet, and resolving
    // a display name would otherwise fall back to a "removed user" label. It
    // only fills a missing entry: the one the server sent already has the
    // picture, which a peer message does not carry.
    sender?: MessageSender
): MessagesData => {
    const [firstPage = EMPTY_MESSAGES_PAGE, ...restPages] = data?.pages ?? [];

    // The data channel this arrives over is at-least-once, not
    // exactly-once, so a duplicated CHAT frame must not insert the same
    // message twice.
    if (data && firstPage.messages.some((existing) => existing.id === message.id)) {
        return data;
    }

    return {
        pageParams: data?.pageParams ?? [undefined],
        pages: [
            {
                ...firstPage,
                messages: [message, ...firstPage.messages],
                users: withMissingSender(firstPage.users, sender),
            },
            ...restPages,
        ],
    };
};
