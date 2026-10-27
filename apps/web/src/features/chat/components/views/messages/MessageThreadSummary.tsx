import { MessageSquareIcon } from "lucide-react";
import type { MessageWithDetails } from "@standin/contracts";
import { useMessageList } from "@/features/chat/contexts/MessageListContext";
import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";
import { formatReplyCount } from "@/features/chat/utils/formatReplyCount";

type Props = { message: MessageWithDetails };

// The pill under a parent message: how many replies it has and a preview of
// the last one. Both come from the server and the realtime events keep them
// current. Nothing renders for a message without replies, nor from a list
// that cannot open a thread.
export const MessageThreadSummary = ({ message }: Props) => {
    const { onOpenThread } = useMessageList();

    if (!onOpenThread || message.replyCount === 0) return null;

    return (
        <button
            type="button"
            onClick={() => onOpenThread(message.id)}
            className="mt-1 flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-muted"
        >
            <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="shrink-0 font-semibold text-primary">
                {formatReplyCount(message.replyCount)}
            </span>
            <span className="min-w-0 truncate text-muted-foreground">
                {message.lastReplyPreview}
            </span>
            <LastReplyTime lastReplyAt={message.lastReplyAt} />
        </button>
    );
};

const LastReplyTime = ({ lastReplyAt }: { lastReplyAt: string | null }) => {
    if (!lastReplyAt) return null;
    return (
        <span className="shrink-0 text-muted-foreground">
            {formatMessageTime(lastReplyAt)}
        </span>
    );
};
