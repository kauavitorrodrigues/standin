import type { MessageReactionSummary } from "@standin/contracts";
import { MessageReactionPicker } from "@/features/chat/components/views/messages/MessageReactionPicker";
import { MessageReplyAction } from "@/features/chat/components/views/messages/MessageReplyAction";
import { OwnMessageActions } from "@/features/chat/components/views/messages/OwnMessageActions";

type Props = {
    isOwn: boolean;
    disabled?: boolean;
    reactions: MessageReactionSummary[];
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
    onReply: (() => void) | undefined;
    onEdit: () => void;
    onDelete: () => void;
};

// Hidden until the message row is hovered (`group/line`), matching the
// WhatsApp/Discord pattern instead of the reaction trigger sitting inline
// under every message all the time.
export const MessageLineToolbar = ({
    isOwn,
    disabled = false,
    reactions,
    onToggleReaction,
    onReply,
    onEdit,
    onDelete,
}: Props) => (
    <div className="absolute -top-3 right-2 flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover/line:opacity-100">
        <MessageReactionPicker
            reactions={reactions}
            disabled={disabled}
            onToggleReaction={onToggleReaction}
        />
        <MessageReplyAction onReply={onReply} />
        <OwnMessageActions
            isOwn={isOwn}
            disabled={disabled}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    </div>
);
