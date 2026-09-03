import type { MessageSender } from "@standin/contracts";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { MessageGroup } from "@/features/chat/components/views/messages/MessageGroup";
import { MessagesEmptyState } from "@/features/chat/components/views/messages/ContentStates";
import { resolveSender } from "@/features/chat/utils/resolveSender";
import type { MessageGroup as MessageGroupType } from "@/features/chat/utils/groupMessagesBySender";

type Props = {
    groups: MessageGroupType[];
    users: Record<string, MessageSender>;
    currentUser: { id: string; name: string };
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
};

// Decides itself whether there is anything to list, instead of the parent
// choosing between the empty state and the mapped groups inline.
export const MessageGroupList = ({
    groups,
    users,
    currentUser,
    onToggleReaction,
}: Props) => {
    if (groups.length === 0) return <MessagesEmptyState />;

    return groups.map((group) => (
        <MessageScrollerItem key={group.key} messageId={group.key}>
            <MessageGroup
                group={group}
                sender={resolveSender(group.senderId, users, currentUser)}
                isOwn={group.senderId === currentUser.id}
                onToggleReaction={onToggleReaction}
            />
        </MessageScrollerItem>
    ));
};
