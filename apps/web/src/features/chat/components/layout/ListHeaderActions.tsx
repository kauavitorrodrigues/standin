import { RefreshButton } from "@/features/chat/components/layout/RefreshButton";
import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";
import { NewConversationButton } from "@/features/chat/components/layout/NewConversationButton";
import type { HeaderActionsProps } from "@/features/chat/types/views";

export const ListHeaderActions = ({
    onRefresh,
    onClose,
    onOpenNewConversation,
}: HeaderActionsProps) => (
    <>
        <RefreshButton onClick={onRefresh} />
        <NewConversationButton onClick={onOpenNewConversation} />
        <CloseSidebarButton onClick={onClose} />
    </>
);
