import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";
import type { HeaderActionsProps } from "@/features/chat/types/views";

export const NewConversationHeaderActions = ({
    onClose,
}: HeaderActionsProps) => <CloseSidebarButton onClick={onClose} />;
