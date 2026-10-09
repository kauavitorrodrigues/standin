import type { SpaceDetails } from "@standin/contracts";
import { ConversationThread } from "@/features/chat/components/instances/ConversationThread";
import { CopyLinkButton } from "@/features/chat/components/layout/CopyLinkButton";
import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { ParticipantsButton } from "@/features/chat/components/layout/ParticipantsButton";
import { OnlineSummary } from "@/features/chat/components/views/presence/OnlineSummary";
import { useChatPage } from "@/features/chat/contexts/ChatPageContext";
import { ChatQueries } from "@/features/chat/queries";
import type { SelectedConversation } from "@/features/chat/types/chatPage";

type Props = {
    space: SpaceDetails;
    conversation: SelectedConversation;
    onOpenParticipants: () => void;
};

export const ThreadPanel = ({
    space,
    conversation,
    onOpenParticipants,
}: Props) => {
    const { participants } = ChatQueries.useParticipants(conversation.id);
    const { onlineUserIds, getConversationLink } = useChatPage();
    const onlineUsers = participants.filter((participant) =>
        onlineUserIds.includes(participant.id)
    );

    return (
        <>
            <HeaderShell
                title={conversation.title}
                avatar={conversation.avatar}
            >
                <div className="flex h-7 items-stretch divide-x overflow-hidden rounded-lg bg-muted/50 ring-1 ring-foreground/10">
                    <OnlineSummary onlineUsers={onlineUsers} />
                    <ParticipantsButton
                        count={participants.length}
                        onClick={onOpenParticipants}
                    />
                </div>
                <CopyLinkButton link={getConversationLink(conversation.id)} />
            </HeaderShell>
            <ConversationThread
                // Remounted per conversation so nothing (scroll, draft, the
                // new-message animation flags) leaks from the previous chat.
                key={conversation.id}
                conversationId={conversation.id}
                // Whether there's only ever one other person who could
                // possibly read this message. Approximated today via "not the
                // space conversation", since DIRECT is currently always
                // exactly 1:1. If a future conversation type (e.g. a group
                // DM) breaks that assumption, this should switch to an actual
                // participant count instead of the conversation type.
                hasSingleViewer={conversation.id !== space.conversationId}
            />
        </>
    );
};
