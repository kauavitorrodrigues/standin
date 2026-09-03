import { MessageList } from "@/features/chat/components/instances/MessageList";
import { SendMessageForm } from "@/features/chat/components/forms/SendMessageForm";

type Props = { conversationId: string };

// Groups the message history and the composer together so the sidebar's
// per-view dispatch can treat the thread as a single body component.
export const ConversationThread = ({ conversationId }: Props) => (
    <>
        <MessageList conversationId={conversationId} />
        <SendMessageForm conversationId={conversationId} />
    </>
);
