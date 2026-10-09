import { HashIcon } from "lucide-react";
import { CountBadge } from "@/components/ui/count-badge";

type Props = {
    name: string;
    unreadCount: number;
    selected: boolean;
    onSelect: () => void;
};

// A channel: a hash and the lowercase name, no avatar.
export const ConversationItem = ({
    name,
    unreadCount,
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
            <HashIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{name.toLowerCase()}</span>
            <CountBadge count={unreadCount} />
        </button>
    );
};
