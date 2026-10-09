import type { ConversationSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";
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
    const other = conversation.participants[0];
    if (!other) return null;

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-current={selected}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm transition-colors hover:bg-muted aria-[current=true]:bg-muted"
        >
            <UserAvatar
                id={other.id}
                name={other.name}
                avatar={other.avatarUrl}
                size="xs"
            />
            <span className="flex-1 truncate">{other.name}</span>
            <CountBadge count={conversation.unreadCount} />
        </button>
    );
};
