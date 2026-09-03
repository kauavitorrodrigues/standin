import type { MessageWithDetails } from "@standin/contracts";
import { MessageLineContent } from "@/features/chat/components/views/messages/MessageLineContent";
import { MessageLineTimestamp } from "@/features/chat/components/views/messages/MessageLineTimestamp";

type Props = {
    message: MessageWithDetails;
    isOwn: boolean;
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
};

// Mirrors the first message's row in width, padding and hover background,
// but has no avatar of its own: the timestamp takes that gutter instead,
// shown only while this specific row is hovered.
export const MessageLine = ({ message, isOwn, onToggleReaction }: Props) => (
    <div className="group/line relative rounded-md py-1 pr-3 pl-13 hover:bg-muted/20">
        <MessageLineTimestamp createdAt={message.createdAt} />
        <MessageLineContent
            message={message}
            isOwn={isOwn}
            onToggleReaction={onToggleReaction}
        />
    </div>
);
