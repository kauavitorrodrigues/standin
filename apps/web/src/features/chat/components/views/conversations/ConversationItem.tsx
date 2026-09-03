import type { LucideIcon } from "lucide-react";

type Props = {
    icon: LucideIcon;
    name: string;
    onSelect: () => void;
};

export const ConversationItem = ({ icon: Icon, name, onSelect }: Props) => {
    return (
        <button
            type="button"
            onClick={onSelect}
            className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" />
            </span>
            <span className="truncate text-sm font-medium">{name}</span>
        </button>
    );
};
