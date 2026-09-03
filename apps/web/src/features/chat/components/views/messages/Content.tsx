import type { UIEvent } from "react";
import type { MessageSender } from "@standin/contracts";
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
    isLoading: boolean;
    isError: boolean;
    onViewportScroll: (event: UIEvent<HTMLDivElement>) => void;
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
};

export const Content = ({
    groups,
    users,
    currentUser,
    isLoading,
    isError,
    onViewportScroll,
    onToggleReaction,
}: Props) => {
    if (isLoading) return <MessagesLoadingState />;
    if (isError) return <MessagesErrorState />;

    return (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="min-h-0 flex-1">
                <MessageScrollerViewport onScroll={onViewportScroll}>
                    <MessageScrollerContent className="justify-end">
                        <MessageGroupList
                            groups={groups}
                            users={users}
                            currentUser={currentUser}
                            onToggleReaction={onToggleReaction}
                        />
                    </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
            </MessageScroller>
        </MessageScrollerProvider>
    );
};
