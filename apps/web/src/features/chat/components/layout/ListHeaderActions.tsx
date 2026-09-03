import { RefreshButton } from "@/features/chat/components/layout/RefreshButton";
import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";
import { NewConversationButton } from "@/features/chat/components/layout/NewConversationButton";
import type { HeaderActionsProps } from "@/features/chat/components/layout/HeaderActionsProps";

export const ListHeaderActions = ({
    onRefresh,
    onClose,
}: HeaderActionsProps) => (
    <>
        <RefreshButton onClick={onRefresh} />
        <NewConversationButton />
        <CloseSidebarButton onClick={onClose} />
    </>
);
