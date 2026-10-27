import { MessageList } from "@/features/chat/components/instances/MessageList";
import { SendMessageForm } from "@/features/chat/components/forms/SendMessageForm";
import { ReplyThreadHeader } from "@/features/chat/components/views/messages/ReplyThreadHeader";
import { ReplyThreadParent } from "@/features/chat/components/views/messages/ReplyThreadParent";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { buildOwnSender } from "@/features/chat/utils/buildOwnSender";
import { resolveSender } from "@/features/chat/utils/resolveSender";
import { ChatQueries } from "@/features/chat/queries";

type Props = {
    conversationId: string;
    threadParentId: string;
    hasSingleViewer: boolean;
    onClose: () => void;
};

// The side panel of one thread: the parent on top, its replies and a composer
// of its own. The parent is read from the main list cache, so its reply count
// follows the same realtime updates as the pill in the list.
export const ReplyThreadPanel = ({
    conversationId,
    threadParentId,
    hasSingleViewer,
    onClose,
}: Props) => {
    const { messages, users } = ChatQueries.useMessages(conversationId);
    const { user } = useAuth();
    const parent = messages.find(({ id }) => id === threadParentId);

    return (
        <aside className="flex min-h-0 w-96 shrink-0 flex-col rounded-xl p-2 ring-1 ring-foreground/10">
            <ReplyThreadHeader
                replyCount={parent?.replyCount ?? 0}
                onClose={onClose}
            />
            <ReplyThreadParent
                message={parent}
                sender={
                    parent &&
                    resolveSender(parent.senderId, users, buildOwnSender(user))
                }
            />
            <MessageList
                // Remounted per thread so scroll and animation flags do not
                // leak from the previous one.
                key={threadParentId}
                conversationId={conversationId}
                threadParentId={threadParentId}
                hasSingleViewer={hasSingleViewer}
            />
            <SendMessageForm
                key={threadParentId}
                conversationId={conversationId}
                threadParentId={threadParentId}
            />
        </aside>
    );
};
