import type { ConversationSummary } from "@standin/contracts";
import { ParticipantAvatarStack } from "@/features/chat/components/layout/ParticipantAvatarStack";
import { getDirectConversationTitle } from "@/features/chat/utils/getDirectConversationTitle";
import { CountBadge } from "@/components/ui/count-badge";

type Props = {
    conversation: ConversationSummary;
    selected: boolean;
    onSelect: () => void;
};

export const DirectConversationItem = ({
    conversation,
    selected,
    onSelect,
}: Props) => {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-current={selected}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm transition-colors hover:bg-muted aria-[current=true]:bg-muted"
        >
            <ParticipantAvatarStack
                participants={conversation.participants}
                isNotes={conversation.participants.length === 0}
            />
            <span className="flex-1 truncate">
                {getDirectConversationTitle(conversation.participants)}
            </span>
            <CountBadge count={conversation.unreadCount} />
        </button>
    );
};
