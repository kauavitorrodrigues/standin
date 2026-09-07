import type { ConversationSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { CountBadge } from "@/components/ui/count-badge";

type Props = { conversation: ConversationSummary; onSelect: () => void };

export const DirectConversationItem = ({ conversation, onSelect }: Props) => {
    const other = conversation.participants[0];
    if (!other) return null;

    return (
        <button
            type="button"
            onClick={onSelect}
            className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
        >
            <UserAvatar id={other.id} avatar={other.avatarUrl} size="md" />
            <span className="flex-1 truncate text-sm font-medium">
                {other.name}
            </span>
            <CountBadge count={conversation.unreadCount} />
        </button>
    );
};
