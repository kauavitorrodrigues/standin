import { RefreshButton } from "@/features/chat/components/layout/RefreshButton";
import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";
import type { HeaderActionsProps } from "@/features/chat/types/views";

export const ParticipantsHeaderActions = ({
    onRefresh,
    onClose,
}: HeaderActionsProps) => (
    <>
        <RefreshButton onClick={onRefresh} />
        <CloseSidebarButton onClick={onClose} />
    </>
);
