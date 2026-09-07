import { useMemo } from "react";
import { AnimatePresence } from "motion/react";
import type { MessageSender, MessageWithDetails } from "@standin/contracts";
import { MotionMessageScrollerItem } from "@/components/ui/message-scroller";
import { MessageGroup } from "@/features/chat/components/views/messages/MessageGroup";
import { MessagesEmptyState } from "@/features/chat/components/views/messages/ContentStates";
import { resolveSender } from "@/features/chat/utils/resolveSender";
import { MESSAGE_EXIT } from "@/features/chat/consts/messages";
import type { MessageGroup as MessageGroupType } from "@/features/chat/utils/groupMessagesBySender";

type Props = {
    groups: MessageGroupType[];
    users: Record<string, MessageSender>;
    currentUser: { id: string; name: string };
    hasSingleViewer: boolean;
    newMessageIds: ReadonlySet<string>;
    editedMessageIds: ReadonlySet<string>;
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
    onRequestDelete: (message: MessageWithDetails) => void;
};

export const MessageGroupList = ({
    groups,
    users,
    currentUser,
    hasSingleViewer,
    newMessageIds,
    editedMessageIds,
    onToggleReaction,
    onRequestDelete,
}: Props) => {
    // Memoized so it's the same object across renders (see resolveSender):
    // otherwise every own-message group would get a brand new `sender`
    // prop every render, defeating React.memo(MessageGroup) for exactly
    // the groups the current user sent.
    const ownSender: MessageSender = useMemo(
        () => ({ id: currentUser.id, name: currentUser.name, avatarUrl: null }),
        [currentUser.id, currentUser.name]
    );

    if (groups.length === 0) return <MessagesEmptyState />;

    const lastGroupKey = groups[groups.length - 1].key;

    return (
        <AnimatePresence initial={false}>
            {groups.map((group) => {
                const isOwn = group.senderId === currentUser.id;

                return (
                    <MotionMessageScrollerItem
                        key={group.key}
                        messageId={group.key}
                        initial={false}
                        exit={isOwn ? undefined : MESSAGE_EXIT}
                    >
                        <MessageGroup
                            group={group}
                            sender={resolveSender(
                                group.senderId,
                                users,
                                ownSender
                            )}
                            isOwn={isOwn}
                            isLastGroup={group.key === lastGroupKey}
                            hasSingleViewer={hasSingleViewer}
                            newMessageIds={newMessageIds}
                            editedMessageIds={editedMessageIds}
                            onToggleReaction={onToggleReaction}
                            onRequestDelete={onRequestDelete}
                        />
                    </MotionMessageScrollerItem>
                );
            })}
        </AnimatePresence>
    );
};
