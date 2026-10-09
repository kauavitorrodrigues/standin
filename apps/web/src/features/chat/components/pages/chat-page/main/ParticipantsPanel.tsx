import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { ParticipantList } from "@/features/chat/components/instances/ParticipantList";
import { ChatQueries } from "@/features/chat/queries";
import type { SelectedConversation } from "@/features/chat/types/chatPage";

type Props = {
    conversation: SelectedConversation;
    onBack: () => void;
};

export const ParticipantsPanel = ({ conversation, onBack }: Props) => {
    const { participants } = ChatQueries.useParticipants(conversation.id);

    return (
        <>
            <HeaderShell
                title={`Participantes (${participants.length})`}
                onBack={onBack}
            />
            <ParticipantList conversationId={conversation.id} />
        </>
    );
};
