import { BuildingIcon } from "lucide-react";
import { ConversationItem } from "@/features/chat/components/views/conversations/ConversationItem";
import { DirectMessagesEmptyState } from "@/features/chat/components/views/conversations/ContentStates";

type Props = {
    spaceName: string;
    onSelectSpaceConversation: () => void;
};

export const Content = ({ spaceName, onSelectSpaceConversation }: Props) => {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <ConversationItem
                icon={BuildingIcon}
                name={spaceName}
                onSelect={onSelectSpaceConversation}
            />
            <div className="flex flex-col gap-1">
                <span className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Mensagens diretas
                </span>
                <DirectMessagesEmptyState />
            </div>
        </div>
    );
};
