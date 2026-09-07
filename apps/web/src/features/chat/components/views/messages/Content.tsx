import type { UIEvent } from "react";
import { MotionConfig } from "motion/react";
import type { MessageSender, MessageWithDetails } from "@standin/contracts";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { MessageGroupList } from "@/features/chat/components/views/messages/MessageGroupList";
import {
    MessagesErrorState,
    MessagesLoadingState,
} from "@/features/chat/components/views/messages/ContentStates";
import type { MessageGroup as MessageGroupType } from "@/features/chat/utils/groupMessagesBySender";

type Props = {
    groups: MessageGroupType[];
    users: Record<string, MessageSender>;
    currentUser: { id: string; name: string };
    hasSingleViewer: boolean;
    newMessageIds: ReadonlySet<string>;
    editedMessageIds: ReadonlySet<string>;
    isLoading: boolean;
    isError: boolean;
    onViewportScroll: (event: UIEvent<HTMLDivElement>) => void;
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
    onRequestDelete: (message: MessageWithDetails) => void;
};

export const Content = ({
    groups,
    users,
    currentUser,
    hasSingleViewer,
    newMessageIds,
    editedMessageIds,
    isLoading,
    isError,
    onViewportScroll,
    onToggleReaction,
    onRequestDelete,
}: Props) => {
    if (isLoading) return <MessagesLoadingState />;
    if (isError) return <MessagesErrorState />;

    return (
        <MotionConfig reducedMotion="user">
            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
                <MessageScroller className="min-h-0 flex-1">
                    <MessageScrollerViewport onScroll={onViewportScroll}>
                        <MessageScrollerContent className="justify-end">
                            <MessageGroupList
                                groups={groups}
                                users={users}
                                currentUser={currentUser}
                                hasSingleViewer={hasSingleViewer}
                                newMessageIds={newMessageIds}
                                editedMessageIds={editedMessageIds}
                                onToggleReaction={onToggleReaction}
                                onRequestDelete={onRequestDelete}
                            />
                        </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                </MessageScroller>
            </MessageScrollerProvider>
        </MotionConfig>
    );
};
