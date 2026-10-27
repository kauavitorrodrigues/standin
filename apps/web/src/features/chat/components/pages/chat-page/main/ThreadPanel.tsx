import { useState } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { ConversationThread } from "@/features/chat/components/instances/ConversationThread";
import { OpenReplyThread } from "@/features/chat/components/instances/OpenReplyThread";
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
    // Which thread is open on the side. It belongs to one conversation, so the
    // panel below is remounted per conversation and starts with none.
    const [threadParentId, setThreadParentId] = useState<string | null>(null);
    const { participants } = ChatQueries.useParticipants(conversation.id);
    const { onlineUserIds, getConversationLink } = useChatPage();
    const onlineUsers = participants.filter((participant) =>
        onlineUserIds.includes(participant.id)
    );

    const hasSingleViewer =
        conversation.avatars.length <= 1 && conversation.id !== space.conversationId;

    return (
        <>
            <HeaderShell
                title={conversation.title}
                avatars={conversation.avatars}
                isNotes={conversation.isNotes}
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
            <div className="flex min-h-0 flex-1 gap-2">
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <ConversationThread
                        // Remounted per conversation so nothing (scroll, draft, the
                        // new-message animation flags) leaks from the previous chat.
                        key={conversation.id}
                        conversationId={conversation.id}
                        // A DM with at most one other person (members <= 2) has
                        // a single possible viewer.
                        hasSingleViewer={hasSingleViewer}
                        onOpenThread={setThreadParentId}
                    />
                </div>
                <OpenReplyThread
                    key={conversation.id}
                    conversationId={conversation.id}
                    threadParentId={threadParentId}
                    hasSingleViewer={hasSingleViewer}
                    onClose={() => setThreadParentId(null)}
                />
            </div>
        </>
    );
};
