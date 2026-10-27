import type { MessageWithDetails } from "@standin/contracts";
import { useMessageList } from "@/features/chat/contexts/MessageListContext";

type Props = { message: MessageWithDetails };

// A reply that was also sent to the channel says so in the main list. Inside
// its own thread that would be noise.
export const MessageChannelReplyTag = ({ message }: Props) => {
    const { threadParentId } = useMessageList();

    if (!message.threadParentId || threadParentId) return null;

    return (
        <span className="text-xs text-muted-foreground">
            Respondeu em uma conversa
        </span>
    );
};
