import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { NewConversationButton } from "@/features/chat/components/layout/NewConversationButton";
import { RefreshButton } from "@/features/chat/components/layout/RefreshButton";

type Props = {
    onRefresh: () => void;
    onNewConversation: () => void;
};

export const Header = ({ onRefresh, onNewConversation }: Props) => (
    <HeaderShell title="Chat">
        <RefreshButton onClick={onRefresh} />
        <NewConversationButton onClick={onNewConversation} />
    </HeaderShell>
);
