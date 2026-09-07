import { RefreshButton } from "@/features/chat/components/layout/RefreshButton";
import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";
import { ParticipantsButton } from "@/features/chat/components/layout/ParticipantsButton";
import type { HeaderActionsProps } from "@/features/chat/types/views";

export const ThreadHeaderActions = ({
    participantsCount,
    onRefresh,
    onClose,
    onOpenParticipants,
}: HeaderActionsProps) => (
    <>
        <RefreshButton onClick={onRefresh} />
        <ParticipantsButton
            count={participantsCount}
            onClick={onOpenParticipants}
        />
        <CloseSidebarButton onClick={onClose} />
    </>
);
