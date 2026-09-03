import type { MessageReactionSummary } from "@standin/contracts";
import { MessageReactionPicker } from "@/features/chat/components/views/messages/MessageReactionPicker";
import { OwnMessageActions } from "@/features/chat/components/views/messages/OwnMessageActions";

type Props = {
    isOwn: boolean;
    reactions: MessageReactionSummary[];
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
};

// Hidden until the message row is hovered (`group/line`), matching the
// WhatsApp/Discord pattern instead of the reaction trigger sitting inline
// under every message all the time.
export const MessageLineToolbar = ({
    isOwn,
    reactions,
    onToggleReaction,
    onEdit,
    onDelete,
}: Props) => (
    <div className="absolute -top-3 right-2 flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover/line:opacity-100">
        <MessageReactionPicker
            reactions={reactions}
            onToggleReaction={onToggleReaction}
        />
        <OwnMessageActions isOwn={isOwn} onEdit={onEdit} onDelete={onDelete} />
    </div>
);
